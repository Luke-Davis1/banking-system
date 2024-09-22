let mysql = require('mysql2');

var dbConnectionInfo = require('../lib/connectionInfo');

var con = mysql.createConnection({
    host: dbConnectionInfo.host,
    user: dbConnectionInfo.user,
    password: dbConnectionInfo.password,
    port: dbConnectionInfo.port,
    multipleStatements: true
});

con.connect(function(err) {
    if (err) {
        throw err
    }
    else {
        console.log("database.js: Connected to server!");

        con.query("CREATE DATABASE IF NOT EXISTS banking_system", function(error, result) {
            if (error) {
                console.log(error.message);
                throw error;
            }
            console.log("database.js: banking_system database created");
            // Use this database
            selectDatabase();
        })
    }
});

function selectDatabase() {
    let sql = "USE banking_system;";

    con.query(sql, function(err, result) {
        if (err) {
            console.log("database.js: Unable to use banking_system database");
            throw err;
        }
        console.log("database.js: Selected banking_system database");
        createTables();
        createStoredProcedures();
        // addDummyDataToDatabase();
    })
}

function createTables() {
    // User/Feature tables
    let sql = "CREATE TABLE IF NOT EXISTS user_type (\n" +
                    "user_type_id int NOT NULL AUTO_INCREMENT,\n" +
                    "user_type VARCHAR(255) NOT NULL,\n" +
                    "PRIMARY KEY (user_type_id)\n" +
                ");";

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table user_type created if it didn't exist");
        }
    });
    
    sql = "CREATE TABLE IF NOT EXISTS feature_access (\n" +
                "feature_access_id int NOT NULL AUTO_INCREMENT,\n" +
                "feature_access_type VARCHAR(255) NOT NULL,\n" +
                "PRIMARY KEY (feature_access_id)\n" +
            ");";

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table feature_access created if it didn't exist");
        }
    });

    sql = "CREATE TABLE IF NOT EXISTS user_type_feature_access (\n" +
                "user_type_feature_access_id int NOT NULL AUTO_INCREMENT,\n" +
                "user_type_id int NOT NULL,\n" +
                "feature_access_id int NOT NULL,\n" +
                "PRIMARY KEY (user_type_feature_access_id),\n" +
                "FOREIGN KEY (user_type_id) REFERENCES user_type(user_type_id),\n" +
                "FOREIGN KEY (feature_access_id) REFERENCES feature_access(feature_access_id)\n" +
            ");";

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table user_type_feature_access created if it didn't exist");
        }
    });

    sql = "CREATE TABLE IF NOT EXISTS user (\n" +
                "user_id INT NOT NULL AUTO_INCREMENT,\n" +
                "user_login_id int NOT NULL,\n" +
                "first_name VARCHAR(255) NOT NULL,\n" +
                "last_name VARCHAR(255) NOT NULL,\n" +
                "email VARCHAR(255) NOT NULL UNIQUE,\n" +
                "hashed_password VARCHAR(255) NOT NULL,\n" +
                "salt VARCHAR(255) NOT NULL,\n" +
                "user_type_id int NOT NULL,\n" +
                "PRIMARY KEY (user_id),\n" +
                "FOREIGN KEY (user_type_id) REFERENCES user_type(user_type_id)\n" +
            ");";

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table user created if it didn't exist");
        }
    });

    // Account/Transaction tables
    sql = "CREATE TABLE IF NOT EXISTS account_type (\n" +
                "account_type_id int NOT NULL AUTO_INCREMENT,\n" +
                "account_type VARCHAR(255) NOT NULL,\n" +
                "PRIMARY KEY (account_type_id)\n" +
            ");";

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table account_type created if it didn't exist");
        }
    });
    
    sql = "CREATE TABLE IF NOT EXISTS account (\n" +
                "account_id int NOT NULL AUTO_INCREMENT,\n" +
                "account_type_id int NOT NULL,\n" +
                "user_id int NOT NULL,\n" +
                "current_balance DECIMAL(9, 2) NOT NULL,\n" +
                "PRIMARY KEY (account_id),\n" +
                "FOREIGN KEY (account_type_id) REFERENCES account_type(account_type_id),\n" +
                "FOREIGN KEY (user_id) REFERENCES user(user_id)\n" +
            ");";

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table account created if it didn't exist");
        }
    });

    sql = "CREATE TABLE IF NOT EXISTS transaction (\n" +
                "transaction_id int NOT NULL AUTO_INCREMENT,\n" +
                "transaction_amount DECIMAL(9, 2) NOT NULL,\n" +
                "sending_account_id int NOT NULL,\n" +
                "receiving_account_id int NOT NULL,\n" +
                "memo VARCHAR(255) NOT NULL,\n" +
                "timestamp DATETIME NOT NULL,\n" +
                "PRIMARY KEY (transaction_id),\n" +
                "FOREIGN KEY (sending_account_id) REFERENCES account(account_id),\n" +
                "FOREIGN KEY (receiving_account_id) REFERENCES account(account_id)\n" +
            ");";

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table transaction created if it didn't exist");
        }
    });
}

function createStoredProcedures() {
    let sql = "CREATE PROCEDURE IF NOT EXISTS `insert_user_type`(\n" +
                        "IN input_user_type VARCHAR(255)\n" +
                ")\n" +
                "BEGIN\n" +
                "INSERT INTO user_type (input_user_type)\n" +
                "SELECT user_type FROM DUAL\n" +
                "WHERE NOT EXISTS (\n" +
                    "SELECT * FROM user_type\n" +
                    "WHERE user_type.user_type=input_user_type LIMIT 1\n" +
                ");\n" +
            "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_user_type created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `insert_account_type`(\n" +
                        "IN input_account_type VARCHAR(255)\n" +
                ")\n" +
                "BEGIN\n" +
                "INSERT INTO user_type (input_account_type)\n" +
                "SELECT account_type FROM DUAL\n" +
                "WHERE NOT EXISTS (\n" +
                    "SELECT * FROM account_type\n" +
                    "WHERE account_type.account_type=input_account_type LIMIT 1\n" +
                ");\n" +
            "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_account_type created if it didn't exist");
      }
    });
    
    sql = "CREATE PROCEDURE IF NOT EXISTS `insert_feature_access`(\n" +
                        "IN input_feature_access VARCHAR(255)\n" +
                ")\n" +
                "BEGIN\n" +
                "INSERT INTO feature_access (input_feature_access)\n" +
                "SELECT feature_access_type FROM DUAL\n" +
                "WHERE NOT EXISTS (\n" +
                    "SELECT * FROM feature_access\n" +
                    "WHERE feature_access.feature_access_type=input_feature_access LIMIT 1\n" +
                ");\n" +
            "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_feature_access created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `insert_user_type_feature_access`(\n" +
                     "IN input_user_type VARCHAR(255),\n" +
                     "IN input_feature_access_type VARCHAR(255)\n" +
                ")\n" +
                "BEGIN\n" +
                    "DECLARE input_user_type_id INT;\n" +
                    "DECLARE input_feature_access_id INT;\n" +

                    "SELECT user_type_id INTO input_user_type_id\n" +
                    "FROM user_type\n" +
                    "WHERE user_type = input_user_type\n" +
                    "LIMIT 1;\n" +
                    
                    "SELECT feature_access_id INTO input_feature_access_id\n" +
                    "FROM feature_access\n" +
                    "WHERE feature_access_type = input_feature_access_type\n" +
                    "LIMIT 1;\n" +

                    "IF input_user_type_id IS NOT NULL AND input_feature_access_id IS NOT NULL THEN\n" +
                        "INSERT INTO user_type_feature_access (user_type_id, feature_access_id)\n" +
                        "SELECT input_user_type_id, input_feature_access_id\n" +
                        "FROM DUAL\n" + 
                        "WHERE NOT EXISTS (\n" +
                            "SELECT 1 FROM user_type_feature_access\n" +
                            "WHERE user_type_id = input_user_type_id\n" +
                            "AND feature_access_id = input_feature_access_id\n" +
                        ");\n" +
                    "ELSE\n" +
                        "SELECT 'user_type and feature_access already associated or missing ids in respective tables' AS message;\n" +
                    "END IF;\n" +
                "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_user_type_feature_access created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `create_user`(\n" +
                "IN first_name VARCHAR(255),\n" +
                "IN last_name VARCHAR(255),\n" +
                "IN email VARCHAR(255),\n" +
                "IN hashed_password VARCHAR(255),\n" +
                "IN salt VARCHAR(255),\n" +
                "OUT result INT\n" +
            ")\n" +
            "BEGIN\n" +
                "DECLARE numCount INT DEFAULT 0;\n" +
                "DECLARE new_user_login_id INT;\n" +
                "DECLARE checking_account_type_id INT;\n" + 
                "DECLARE savings_account_type_id INT;\n" +
                "DECLARE new_user_id INT;\n" +

                "DECLARE CONTINUE HANDLER FOR SQLEXCEPTION\n" +
                "BEGIN\n" +
                  "SET result = 1;\n" +
                  "ROLLBACK;\n" +
                "END;\n" +

                "SET result = 0;\n" +
                "SET new_user_login_id = FLOOR(1000 + RAND() * 9000);\n" +
                "SELECT COUNT(*) INTO numCount FROM user WHERE user.user_login_id = new_user_login_id;\n" +
                "START TRANSACTION;\n" + 
                "IF numCount = 0 THEN\n" +
                    "INSERT INTO user (user_login_id, first_name, last_name, email, hashed_password, salt, user_type_id)\n" +
                    "VALUES (new_user_login_id, first_name, last_name, email, hashed_password, salt,\n" +
                    "(SELECT user_type_id from user_type WHERE user_type.user_type = 'customer')\n" +
                    ");\n" +

                    "SELECT user_id INTO new_user_id\n" +
                    "FROM user\n" +
                    "WHERE user.user_login_id = new_user_login_id;\n" +

                    "SELECT account_type_id INTO checking_account_type_id\n" +
                    "FROM account_type\n" +
                    "WHERE account_type.account_type = 'checking';\n" +

                    "SELECT account_type_id INTO savings_account_type_id\n" +
                    "FROM account_type\n" +
                    "WHERE account_type.account_type = 'savings';\n" +

                    "INSERT INTO account (account_type_id, user_id, current_balance)\n" +
                    "VALUES (checking_account_type_id, new_user_id, 0.00);\n" +

                    "INSERT INTO account (account_type_id, user_id, current_balance)\n" +
                    "VALUES (savings_account_type_id, new_user_id, 0.00);\n" +
                "ELSE\n" +
                    "SET result = 1;\n" +
                "END IF;\n" +
                "COMMIT;\n" +
            "END;";
    
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure create_user created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `verify_user_login_id`(\n" +
                    "IN existing_user_login_id INT,\n" +
                    "OUT valid_user TINYINT\n" +
                ")\n" +
                "BEGIN\n" +
                    "SELECT COUNT(*) INTO valid_user\n" +
                    "FROM user\n" +
                    "WHERE user_login_id = existing_user_login_id;\n" +
                "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure verify_user_login_id created if it didn't exist");
      }
    });
    
    sql = "CREATE PROCEDURE IF NOT EXISTS `verify_user_password`(\n" +
                    "IN existing_user_login_id INT,\n" +
                    "IN attempted_hashed_password VARCHAR(255),\n" +
                    "IN attempted_salt VARCHAR(255),\n" +
                    "OUT valid_password TINYINT\n" +
                ")\n" +
                "BEGIN\n" +
                    "SELECT COUNT(*) INTO valid_password\n" +
                    "FROM user\n" + 
                    "WHERE user_login_id = existing_user_login_id\n" +
                    "AND hashed_password = attempted_hashed_password\n" +
                    "AND salt = attempted_salt;\n" +
                "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure verify_user_password created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `update_password`(\n" +
                    "IN existing_user_id INT,\n" +
                    "IN new_hashed_password VARCHAR(255),\n" + 
                    "IN new_salt VARCHAR(255),\n" +
                    "OUT result_message VARCHAR(255)\n" +
                ")\n" +
                "BEGIN\n" +
                    "DECLARE verified_user_id INT;\n" +

                    "DECLARE CONTINUE HANDLER FOR SQLEXCEPTION\n" +
                    "BEGIN\n" +
                    "SET result_message = 'SQLException';\n" +
                    "ROLLBACK;\n" +
                    "END;\n" +

                    "START TRANSACTION;\n" +
                    "SELECT user_id INTO verified_user_id\n" +
                    "FROM user\n" +
                    "WHERE user_id = existing_user_id;\n" +

                    "IF verified_user_id IS NOT NULL THEN\n" +
                        "UPDATE user\n" +
                        "SET hashed_password = new_hashed_password,\n" +
                            "salt = new_salt\n" +
                        "WHERE user_id = verified_user_id;\n" +

                        "COMMIT;\n" +
                        "SET result_message = 'Password update successful';\n" +
                    "ELSE\n" +
                        "ROLLBACK;\n" +
                        "SET result_message = 'User account does not exist';\n" +
                    "END IF;\n" +
                "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure update_password created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_account_id`(\n" +
                    "IN user_id INT,\n" + 
                    "IN account_type VARCHAR(255),\n" +
                    "OUT account_id INT\n" +
                ")\n" +
                "BEGIN\n" +
                    "DECLARE desired_account_type_id INT;\n" + 

                    "SELECT account_type_id INTO desired_account_type_id\n" +
                    "FROM account_type\n" +
                    "WHERE account_type.account_type = account_type;\n" +

                    "SELECT account_id INTO account_id\n" +
                    "FROM account\n" + 
                    "WHERE account.user_id = user_id\n" +
                    "AND account.account_type_id = desired_account_type_id;\n" +
                "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_account_id created if it didn't exist");
      }
    });
    
    sql = "CREATE PROCEDURE IF NOT EXISTS `transfer_money`(\n" +
                    "IN source_account_id INT,\n" +
                    "IN destination_account_id INT,\n" +
                    "IN amount DECIMAL(9,2),\n" +
                    "IN memo VARCHAR(255),\n" +
                    "OUT result_message VARCHAR(255)\n" +
                ")\n" +
                "BEGIN\n" +
                    "DECLARE source_balance DECIMAL(9,2);\n" +
                    
                    "DECLARE CONTINUE HANDLER FOR SQLEXCEPTION\n" +
                    "BEGIN\n" +
                    "SET result_message = 'SQLException';\n" +
                    "ROLLBACK;\n" +
                    "END;\n" +
                    
                    "START TRANSACTION;\n" +
                    "SELECT current_balance INTO source_balance\n" +
                    "FROM account\n" +
                    "WHERE account.account_id = source_account_id;\n" +
                    "IF source_balance >= amount THEN\n" + 
                        "UPDATE account\n" +
                        "SET current_balance = current_balance - amount\n" +
                        "WHERE account_id = source_account_id;\n" +
                        
                        "UPDATE account\n" +
                        "SET current_balance = current_balance + amount\n" +
                        "WHERE account_id = destination_account_id;\n" +

                        "INSERT INTO transaction (transaction_amount, sending_account_id, receiving_account_id, memo, timestamp)\n" +
                        "VALUES (amount, source_account_id, destination_account_id, memo,\n" +
                        "(SELECT NOW())\n" +
                        ");\n" +
                        "COMMIT;\n" +
                        "SET result_message = 'Transaction successful';\n" + 
                    "ELSE\n" +
                        "ROLLBACK;\n" +
                        "SET result_message = 'Insufficient funds';\n" +
                    "END IF;\n" +
                "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure transfer_money created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_id_from_login_id`(\n" +
                    "IN user_login_id INT,\n" +
                    "OUT found_user_id INT\n" +
                ")\n" +
                "BEGIN\n" +
                    "SELECT user_id INTO found_user_id\n" +
                    "FROM user\n" +
                    "WHERE user_login_id = user_login_id;\n" +
                "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_user_id_from_login_id created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_account_balances`(\n" +
                    "IN user_login_id INT,\n" +
                    "OUT savings_current_balance DECIMAL(9,2),\n" +
                    "OUT checking_current_balance DECIMAL(9,2)\n" +
                ")\n" +
                "BEGIN\n" +
                    "DECLARE savings_account_id INT;\n" +
                    "DECLARE checking_account_id INT;\n" +
                    "DECLARE user_id INT;\n" +
                    
                    "CALL get_user_id_from_login_id(user_login_id, user_id);\n" +
                    "CALL get_account_id(user_id, 'savings', savings_account_id);\n" +
                    "CALL get_account_id(user_id, 'checking', checking_account_id);\n" +
                    
                    "SELECT current_balance INTO savings_current_balance\n" +
                    "FROM account\n" +
                    "WHERE account_id = savings_account_id;\n" +

                    "SELECT current_balance INTO checking_current_balance\n" +
                    "FROM account\n" +
                    "WHERE account_id = checking_account_id;\n" +
                "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_account_balances created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_transaction_history`(\n" +
                "IN user_login_id INT,\n" +
                "IN account_type VARCHAR(255)\n" +
            ")\n" +
            "BEGIN\n" +
                "DECLARE user_id INT;\n" +
                "DECLARE account_id INT;\n" +

                "CALL get_user_id_from_login_id(user_login_id, user_id);\n" +
                "CALL get_account_id(user_id, account_type, account_id);\n" +

                "SELECT\n" +
                    "CASE\n" +
                        "WHEN sending_account_id = account_id THEN -1 * transaction_amount\n" +
                        "ELSE transaction_amount\n" +
                    "END AS adjusted_transaction_amount,\n" +
                    "memo,\n" +
                    "timestamp\n" +
                "FROM transaction\n" +
                "WHERE sending_account_id = account_id\n" +
                "OR receiving_account_id = account_id;\n" +
            "END;"; 

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_transaction_history created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `has_feature_access`(\n" +
                "IN user_login_id INT,\n" +
                "IN desired_feature VARCHAR(255),\n" +
                "OUT has_access INT\n" +
            ")\n" +
            "BEGIN\n" +
                "DECLARE user_id INT;\n" +
                "DECLARE feature_access_id INT;\n" +
                "DECLARE user_type_id INT;\n" +
                
                "CALL get_user_id_from_login_id(user_login_id, user_id);\n" +

                "SELECT feature_access_id INTO feature_access_id\n" +
                "FROM feature_access\n" +
                "WHERE feature_access_type = desired_feature;\n" +

                "SELECT user_type_id INTO user_type_id\n" +
                "FROM user\n" +
                "WHERE user_id = user_id;\n" +

                "SELECT COUNT(*) INTO has_access\n" +
                "FROM user_type_feature_access\n" +
                "WHERE user_type_id = user_type_id\n" +
                "AND feature_access_id = feature_access_id;\n" +
            "END;";
    
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure has_feature_access created if it didn't exist");
      }
    });

    // In order to update a user to an admin, their account balances must be zero
    sql = "CREATE PROCEDURE IF NOT EXISTS `change_user_type`(\n" +
                "IN user_login_id INT,\n" +
                "IN desired_user_type VARCHAR(255),\n" +
                "OUT result_message VARCHAR(255)\n" +
            ")\n" +
            "BEGIN\n" +
                "DECLARE current_user_type_id INT;\n" +
                "DECLARE current_user_id INT;\n" +
                "DECLARE desired_user_type_id INT;\n" +
                "DECLARE savings_current_balance DECIMAL(9,2);\n" +
                "DECLARE checking_current_balance DECIMAL(9,2);\n" +

                "CALL get_user_id_from_login_id(user_login_id, current_user_id);\n" +

                "SELECT user_type_id INTO current_user_type_id\n" +
                "FROM user\n" +
                "WHERE user_id = current_user_id;\n" +

                "SELECT user_type_id INTO desired_user_type_id\n" +
                "FROM user_type\n" +
                "WHERE user_type = desired_user_type;\n" +

                "IF desired_user_type_id = current_user_type_id THEN\n" +            
                    "SET result_message = 'user already holds desired type';\n" +
                "ELSE\n" +
                    "IF desired_user_type = 'admin' THEN\n" +
                      "CALL get_account_balances(user_login_id, savings_current_balance, checking_current_balance);\n" +

                      "IF savings_current_balance = 0.00 AND checking_current_balance = 0.00 THEN\n" +
                          "UPDATE user\n" +
                          "SET user_type_id = desired_user_type_id\n" +
                          "WHERE user_id = current_user_id;\n" +
                          "SET result_message = 'Success updating role';\n" +
                      "ELSE\n" +
                          "SET result_message = 'User must have $0.00 as current balances';\n" +
                      "END IF;\n" +
                    "ELSE\n" +
                      "UPDATE user\n" +
                      "SET user_type_id = desired_user_type_id\n" +
                      "WHERE user_id = current_user_id;\n" +
                      "SET result_message = 'Success updating role';\n" +
                    "END IF;\n" +
                "END IF;\n" +
            "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure change_user_type created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_details`(\n" +
                "IN user_login_id INT\n" +
            ")\n" +
            "BEGIN\n" +
                "SELECT first_name, last_name, user_login_id, email\n" +
                "FROM user\n" + 
                "WHERE user_login_id = user_login_id;\n" +
            "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_user_details created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `get_current_balance`(\n" +
                "IN user_login_id INT,\n" +
                "IN desired_account_type VARCHAR(255),\n" +
                "OUT current_balance DECIMAL(9,2)\n" +
            ")\n" +
            "BEGIN\n" +
                "DECLARE user_id INT;\n" +
                "DECLARE account_id INT;\n" +
                
                "CALL get_user_id_from_login_id(user_login_id, user_id);\n" +
                
                "CALL get_account_id(user_id, desired_account_type, account_id);\n" +
                
                "SELECT current_balance INTO current_balance\n" +
                "FROM account\n" +
                "WHERE account_id = account_id;\n" +
            "END;";

    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_current_balance created if it didn't exist");
      }
    });            

}

module.exports = con;