const express = require('express');
const app = express();
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require('nodemailer');
const xlsx = require('xlsx');
const bcrypt = require("bcryptjs");
const csvParser = require('csv-parser');
const fs = require('fs'); // Import fs module
const multer = require("multer");
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const pg = require('pg');
require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize'); // Import Sequelize and DataTypes

const JWT_SECRET = "Hjkl2345Olkj0987Ooiuyhjnb0987Nbvcty12fgh675redf23"; // Define your JWT secret key

const db = new pg.Pool({
    user: "postgres",
    host: "34.71.87.187",
    database: "IncidentManagement",
    password: "India@5555",
    port: 5432,
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* USER AUTH ****************** */
const sequelize = new Sequelize("IncidentManagement", "postgres", "India@5555", {
    host: "34.71.87.187",
    dialect: "postgres",
});

const User = sequelize.define("User", { // Model name should be singular and PascalCase
    name: { 
        type: DataTypes.STRING, // Add the name field
        allowNull: false, // You can set this to true if the name is optional
    },
    
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isadmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: "users", // Use the existing table name
    timestamps: false, // Disable timestamps if they are not present in the existing table
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be uploaded
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ dest: 'uploads/' });
app.post('/citincident-api/upload-users', upload.single('file'), async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const users = [];

    try {
        if (path.extname(req.file.originalname) === '.csv') {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => {
                    console.log('Parsed row:', row);
                    const { name, email, password, role, roletype, companyname, designation, empcode } = row;
                    if (!name || !email || !password) {
                        console.warn(`Skipping user with email ${email || 'undefined'} due to missing required fields`);
                        return;
                    }
                    users.push({ name, email, password: password.toString(), role, roletype, companyname, designation, empcode });
                })
                .on('end', async () => {
                    try {
                        console.log('Users to be hashed:', users);
                        const hashedUsers = await Promise.all(users.map(async (user) => {
                            try {
                                const hashedPassword = await bcrypt.hash(user.password, 10);
                                return { ...user, password: hashedPassword };
                            } catch (error) {
                                console.error(`Error hashing password for user ${user.email}:`, error);
                                throw error;
                            }
                        }));

                        console.log('Hashed users:', hashedUsers);

                        const sqlInsert = `INSERT INTO users (name, email, password, role, roletype, companyname, designation, empcode) 
                                           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
                        
                        await Promise.all(hashedUsers.map(userData => 
                            db.query(sqlInsert, [userData.name, userData.email, userData.password, userData.role, userData.roletype, userData.companyname, userData.designation, userData.empcode])
                        ));

                        fs.unlinkSync(filePath);
                        res.status(200).json({ message: 'Users uploaded successfully' });
                    } catch (error) {
                        console.error('Error inserting users into database:', error);
                        res.status(500).json({ error: 'Error inserting users into database' });
                    }
                })
                .on('error', (error) => {
                    console.error('Error reading file:', error);
                    res.status(500).json({ error: 'Error reading file' });
                });
        } else if (path.extname(req.file.originalname) === '.xlsx') {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);

            console.log('Parsed Excel data:', data);
            data.forEach((row) => {
                const { name, email, password, role, roletype, companyname, designation, empcode } = row;
                if (!name || !email || !password) {
                    console.warn(`Skipping user with email ${email || 'undefined'} due to missing required fields`);
                    return;
                }
                users.push({ name, email, password: password.toString(), role, roletype, companyname, designation, empcode });
            });

            try {
                console.log('Users to be hashed:', users);
                const hashedUsers = await Promise.all(users.map(async (user) => {
                    try {
                        const hashedPassword = await bcrypt.hash(user.password, 10);
                        return { ...user, password: hashedPassword };
                    } catch (error) {
                        console.error(`Error hashing password for user ${user.email}:`, error);
                        throw error;
                    }
                }));

                console.log('Hashed users:', hashedUsers);

                const sqlInsert = `INSERT INTO users (name, email, password, role, roletype, companyname, designation, empcode) 
                                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
                
                await Promise.all(hashedUsers.map(userData => 
                    db.query(sqlInsert, [userData.name, userData.email, userData.password, userData.role, userData.roletype, userData.companyname, userData.designation, userData.empcode])
                ));

                fs.unlinkSync(filePath);
                res.status(200).json({ message: 'Users uploaded successfully' });
            } catch (error) {
                console.error('Error inserting users into database:', error);
                res.status(500).json({ error: 'Error inserting users into database' });
            }
        } else {
            fs.unlinkSync(filePath);
            res.status(400).json({ error: 'Unsupported file type' });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error occurred' });
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
});

// Signup route
app.post("/citincident-api/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        res.status(201).send("User created");
    } catch (err) {
        console.error(err);
        res.status(400).send("Error creating user");
    }
});
app.use(bodyParser.json());

app.post('/citincident-api/upload', async (req, res) => {
    const data = req.body;
  
    // Insert data into the database
    try {
      for (const row of data) {
        // Ensure each row contains the necessary fields
        const {sector, incidentcategory, incidentname, incidentdescription } = row;
  
        // Adjust the query and fields based on your table schema
        // Check for duplicates based on incidentname (or any other unique identifier)
        const checkQuery = 'SELECT COUNT(*) FROM agroincidentcategorym WHERE incidentname = $1';
        const checkValues = [incidentname];
        const result = await db.query(checkQuery, checkValues);
  
        if (parseInt(result.rows[0].count) === 0) {
          // Only insert if no duplicates are found
          const insertQuery = 'INSERT INTO agroincidentcategorym (sector,incidentcategory, incidentname, incidentdescription) VALUES ($1, $2, $3,$4)';
          const insertValues = [sector,incidentcategory, incidentname, incidentdescription];
  
          await db.query(insertQuery, insertValues);
        } else {
          console.warn(`Duplicate entry found for incidentname: ${incidentname}`);
          // Optionally, you can send a response or log duplicates here if needed
        }
      }
      res.status(200).send('Data uploaded successfully!');
    } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).send('Error uploading data.');
    }
  });
  

  // Multer storage configuration
  const storageex = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify your upload directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Add a timestamp to the filename
    }
});

const uploadex = multer({ storage: storageex });

app.post('/citincident-api/upload-masterexcel', uploadex.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    console.log("Uploaded file path:", filePath);

    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        console.log("Extracted Data:", data);

        for (const row of data) {
            const { sector, incidentcategory, incidentname, city, tagss, informationdescription, informationmastertype } = row;

            // Validate required fields
            if (!incidentname || !informationdescription || !informationmastertype) {
                console.warn(`Missing required fields in row: ${JSON.stringify(row)}`);
                continue;
            }

            // Convert tagss string to a proper array format
            let tagsArray = null;
            if (tagss) {
                const tagsList = tagss.split(',').map(tag => tag.trim()).filter(tag => tag); // Trim and filter empty tags
                tagsArray = `{${tagsList.join(',')}}`; // Use correct array syntax for PostgreSQL
            }

            const insertQuery = `
                INSERT INTO informationmaster 
                (sector, incidentcategory, incidentname, city, tagss, informationdescription, informationmastertype) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            const insertValues = [
                sector || null,
                incidentcategory || null,
                incidentname,
                city || null,
                tagsArray, // Use the formatted array
                informationdescription, // Use as is
                informationmastertype || null
            ];

            // Check for duplicates
            const checkQuery = 'SELECT COUNT(*) FROM informationmaster WHERE incidentname = $1';
            const checkValues = [incidentname];
            const result = await db.query(checkQuery, checkValues);
            console.log("Duplicate check result:", result.rows[0].count);

            if (parseInt(result.rows[0].count) === 0) {
                console.log("Executing Query:", insertQuery);
                console.log("With Values:", insertValues);

                try {
                    await db.query(insertQuery, insertValues);
                    console.log(`Inserted: ${incidentname}`);
                } catch (insertError) {
                    console.error("Error inserting data:", insertError);
                }
            } else {
                console.warn(`Duplicate entry found for incidentname: ${incidentname}`);
            }
        }

        res.status(200).send('Data uploaded successfully!');
    } catch (error) {
        console.error("Error processing data:", error);
        res.status(500).send('Error uploading data.');
    }
});


// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ where: { email } });
//         if (!user) {
//             return res.status(400).send("User not found");
//         }
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).send("Invalid credentials");
//         }
//         const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
//             expiresIn: "1h",
//         });
//         res.json({ token, email: user.email }); // Include email in the response
//     } catch (err) {
//         console.error(err);
//         res.status(400).send("Error logging in");
//     }
// });

// Protected route example
app.get("/protected", (req, res) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).send("Access denied");
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.send("Protected data");
    } catch (err) {
        res.status(401).send("Invalid token");
    }
});
//Admin

// Login route
app.post("/citincident-api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).send("User not found");

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("Invalid credentials");

        // Include both userId and email in the JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },  // Add email here
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Return the token along with user email and isAdmin status
        res.json({
            token,
            email: user.email,
            isAdmin: user.isadmin
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error logging in");
    }
});


  

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Route to check if the user is an admin
// Route to check if the user is an admin
app.get('/citcitincident-api/isAdmin', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await db.query('SELECT isadmin FROM users WHERE id = $1', [userId]); // Updated column name
        if (result.rows.length > 0) {
            res.json({ isAdmin: result.rows[0].isadmin }); // Updated field name
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// // Example protected route for admin users
// app.get('/api/admin-only', authenticateToken, adminMiddleware, (req, res) => {
//     res.send('This is an admin-only route');
// });
//foreget passowrd 
// Nodemailer transporter setup

const decodeToken = (token) => {
    try {
        // Replace 'your-secret-key' with your actual secret key
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded; // Decoded token, which may include user info like name
    } catch (err) {
        console.error('Token decoding failed:', err);
        return null;
    }
};
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'vaishnavisd23@gmail.com',
      pass: 'pyxo oadt rfcu lcxg', // Replace with your actual email credentials
    },
  });
  
  // Function to send reset email
  const sendResetEmail = (email,name,token) => {
    const baseURL = process.env.BASE_URL
    const mailOptions = {
      from: 'vaishnavisd23@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: ``,
    html: `<p>Hi ${name || "User"},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${baseURL}reset-password/${token}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  };
app.post('/citincident-api/forget-password', async (req, res) => {
    const { email } = req.body;
    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(400).send('User not found');
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        sendResetEmail(email, user.name, token);
        res.send('Password reset link sent to your email');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.post('/citincident-api/reset-password', async (req, res) => {
    const { token, password } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, decoded.id]);

        if (result.rowCount === 0) {
            return res.status(400).send('User not found or password not updated');
        }
        res.send('Password has been reset');
    } catch (error) {
        console.error(error);
        res.status(500).send('Invalid or expired token');
    }
});

  //get users data

  // Route to get all users with their passwords
app.get('/citincident-api/users', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
 //to Add User through Admin screen
 const saltRounds = 10;
app.post("/citincident-api/userspost", async (req, res) => {
    const {
        name, email, password, role, roletype, companyname, designation, empcode
    } = req.body;

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const sqlInsert = `
            INSERT INTO users (name, email, password, role, roletype, companyname, designation, empcode) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        const values = [
            name, email, hashedPassword, role, roletype, companyname, designation, empcode
        ];
        
        db.query(sqlInsert, values, (error, result) => {
            if (error) {
                console.error("Error inserting data", error);
                res.status(500).json({ error: "Internal server error" });
            } else {
                res.status(200).json({ message: "User inserted successfully" });
            }
        });
    } catch (error) {
        console.error("Error hashing password", error);
        res.status(500).json({ error: "Error hashing password" });
    }
});


//get user

app.get("/citincident-api/userget/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // Convert regid to a number
        const useridNumber = parseInt(id);

        const sqlGet = "SELECT * FROM users WHERE id = $1";
        const result = await db.query(sqlGet, [useridNumber]);
        res.send(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the object type");
    }
});
app.put("/citincident-api/userupdate/:id", (req, res) => {
    const { id } = req.params;
    const {name,email,
        password,
        role,
        roletype,
        companyname,
        designation,
        empcode} = req.body;

    const sqlUpdate = "UPDATE users SET name=$1, email=$2, password=$3, role=$4, roletype=$5, companyname=$6, designation=$7, empcode=$8 WHERE id=$9";
    db.query(sqlUpdate, [name,email,
        password,
        role,
        roletype,
        companyname,
        designation,
        empcode, id], (error, result) => {
        if (error) {
            console.error("Error updating object type:", error);
            return res.status(500).send("An error occurred while updating the object type");
        }
        res.send("Object type updated successfully");
    });
});
// Route to get user incidents
app.get("/citincident-api/user-incidents/:email", authenticateToken, (req, res) => {
    const email = req.params.email; // Correctly access email from req.params

    const sqlGet = "SELECT * FROM incident WHERE raisedtouser = $1";

    db.query(sqlGet, [email], (error, result) => {
        if (error) {
            console.error("Error fetching incidents:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(result.rows);
    });
});

app.get("/citincident-api/user-resolutions/:userId", authenticateToken, (req, res) => {
    const userId = req.params.userId; // Correctly access userId from req.params
  
    const sqlGetResolutions = "SELECT * FROM resolution WHERE id = $1";
  
    db.query(sqlGetResolutions, [userId], (error, result) => {
      if (error) {
        console.error("Error fetching resolutions:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json(result.rows);
    });
  });
  app.get('/citincident-api/userid', async (req, res) => {
    const { email } = req.query;
  
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
  
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
//Route for incident category
app.get("/citincident-api/agroincidentcategoryget", (req, res) => {
        const sqlGet = "SELECT * FROM agroincidentcategorym";
        db.query(sqlGet, (error, result) => {
            if (error) {
                console.error("Error fetching resolutions:", error);
                return res.status(500).json({ error: "Internal server error" });
            }
            res.json(result.rows);
        });
    });

    //add a query
app.post("/citincident-api/incidentcategorypost", (req, res) => {
    const {sector,incidentcategory,incidentname,incidentdescription} = req.body;
    const sqlInsert = "INSERT INTO agroincidentcategorym (sector,incidentcategory,incidentname,incidentdescription) VALUES ($1, $2, $3, $4)";
    const values=[sector,incidentcategory,incidentname,incidentdescription];
    db.query(sqlInsert ,values,(error,result)=>{
        if (error) {
            console.error("error intersting object type",error);
            res.status(500).json({error:"internal server error"})
        }else{
            res.status(200).json({message:"object type inserted sucessfully"});
        }
    } );
});
/******delete *******/
app.delete("/citincident-api/incidentcategorydelete/:incidentcategoryid", (req, res) => {
    const {incidentcategoryid} = req.params;
    const sqlRemove="DELETE FROM agroincidentcategorym where incidentcategoryid=$1";
    db.query(sqlRemove ,[incidentcategoryid],(error,result)=>{
        if(error) {
            console.log(error);
            return res.status(500).send("an error occurred while deleting object type")
        }
        res.send("object type deleted successfully")
    } );
});
app.get("/citincident-api/incidentcategoryget/:incidentcategoryid", async (req, res) => {
    try {
        const { incidentcategoryid } = req.params;
        // Convert regid to a number
        const incidentcidNumber = parseInt(incidentcategoryid);

        const sqlGet = "SELECT * FROM agroincidentcategorym WHERE incidentcategoryid = $1";
        const result = await db.query(sqlGet, [incidentcidNumber]);
        res.send(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the object type");
    }
});
app.put("/citincident-api/incidentcategoryupdate/:incidentcategoryid", (req, res) => {
    const { incidentcategoryid } = req.params;
    const { sector, incidentcategory, incidentname, incidentdescription } = req.body;

    const sqlUpdate = "UPDATE agroincidentcategorym SET sector=$1, incidentcategory=$2, incidentname=$3, incidentdescription=$4 WHERE incidentcategoryid=$5";
    db.query(sqlUpdate, [sector, incidentcategory, incidentname, incidentdescription, incidentcategoryid], (error, result) => {
        if (error) {
            console.error("Error updating object type:", error);
            return res.status(500).send("An error occurred while updating the object type");
        }
        res.send("Object type updated successfully");
    });
});
//incident category tagging

app.get("/citincident-api/agroincidentsectorgets", (req, res) => {
    const sqlGet = "SELECT DISTINCT sector FROM agroincidentcategorym";
    db.query(sqlGet, (error, result) => {
        if (error) {
            console.error("Error fetching incident categories:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(result.rows);
    });
});
app.get("/citincident-api/agroincidentcategorygets", (req, res) => {
    // Extract the sector from the query parameters
    const sector = req.query.sector;

    // Validate that the sector parameter is provided
    if (!sector) {
        return res.status(400).json({ error: "Sector parameter is required" });
    }

    // Define the SQL query with a parameter placeholder
    const sqlGet = "SELECT DISTINCT incidentcategory FROM agroincidentcategorym WHERE sector=$1";

    // Execute the query with the sector parameter
    db.query(sqlGet, [sector], (error, result) => {
        if (error) {
            console.error("Error fetching incident categories:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(result.rows);
    });
});
app.get("/citincident-api/agroincidentnamegets", (req, res) => {
    const { incidentcategory } = req.query; // Extract incidentcategory from query parameters

    if (!incidentcategory) {
        return res.status(400).json({ error: "Incident category is required" });
    }

    const sqlGet = "SELECT incidentname FROM agroincidentcategorym WHERE incidentcategory = $1";

    db.query(sqlGet, [incidentcategory], (error, result) => {
        if (error) {
            console.error("Error fetching incident names:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(result.rows);
    });
});
app.get("/citincident-api/agroincidentdescriptiongets", (req, res) => {
    const { incidentname } = req.query; // Extract incidentname from query parameters

    if (!incidentname) {
        return res.status(400).json({ error: "Incident name is required" });
    }

    const sqlGet = "SELECT DISTINCT incidentdescription FROM agroincidentcategorym WHERE incidentname = $1";

    db.query(sqlGet, [incidentname], (error, result) => {
        if (error) {
            console.error("Error fetching incident descriptions:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(result.rows);
    });
});
//information master 
app.get("/citincident-api/informationmastergets", (req, res) => {
    const sqlGet = "SELECT * FROM informationmaster";
    db.query(sqlGet, (error, result) => {
        if (error) {
            console.error("Error fetching incident categories:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(result.rows);
    });
});



// Initialize multer with the storage configuration


app.use('/citincident-api/infor-imguploads', express.static('uploads'));

const storagim = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadingm = multer({ storage: storagim });

// Endpoint to handle both text and image uploads
app.post("/citincident-api/informationmasterpost", uploadingm.single('image'), (req, res) => {
    const { 
      sector, 
      incidentcategory, 
      incidentname, 
      city, 
      tagss, 
      informationmastertype, 
      informationdescription // This should contain content (HTML format) and image
    } = req.body;
  
    // Parse the informationdescription string into an object
    let infoDescription = {};
    try {
      infoDescription = JSON.parse(informationdescription || "{}");
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON format for informationdescription" });
    }
  
    // Access the HTML content directly
    const content = infoDescription.content || ""; // Raw HTML content
  
    // If there's an image file, we store its path
    const imagePath = req.file ? req.file.filename : ""; // Adjust based on your storage solution
  
    // Create the formatted informationdescription object with HTML content and image
    const formattedDescription = {
      content: content, // Raw HTML content, which may contain URLs within it
      image: imagePath  // Store the image path if available
    };
  
    // Ensure tags are properly formatted as a PostgreSQL array
    let tagssArray = Array.isArray(tagss) ? tagss : tagss.split(",");
    tagssArray = tagssArray.map(tagi => tagi.trim());
    const formattedTags = `{${tagssArray.join(",")}}`;  // PostgreSQL array format
  
    // Log the received data for debugging
    console.log("Post Request Data:", { 
      sector, 
      incidentcategory, 
      incidentname, 
      city, 
      formattedTags, 
      informationmastertype, 
      formattedDescription 
    });
  
    // SQL Query for inserting new record
    const sqlInsert = `
      INSERT INTO informationmaster 
          (sector, incidentcategory, incidentname, city, tagss, informationmastertype, informationdescription)
      VALUES 
          ($1, $2, $3, $4, $5, $6, $7)
    `;
  
    const values = [
      sector,
      incidentcategory,
      incidentname,
      city,
      formattedTags, // Tags formatted as a PostgreSQL array
      informationmastertype,
      JSON.stringify(formattedDescription) // Store as JSON string
    ];
  
    // Log the SQL command and values for debugging
    console.log("SQL Insert Command:", sqlInsert);
    console.log("Values to Insert:", values);
  
    // Execute the database query
    db.query(sqlInsert, values, (error, result) => {
      if (error) {
        console.error("Error inserting record:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(201).json({ message: "Information added successfully" });
    });
  });

/******delete *******/
app.delete("/citincident-api/informationmasterdelete/:informationmasterid", (req, res) => {
    const {informationmasterid} = req.params;
    const sqlRemove="DELETE FROM informationmaster where informationmasterid=$1";
    db.query(sqlRemove ,[informationmasterid],(error,result)=>{
        if(error) {
            console.log(error);
            return res.status(500).send("an error occurred while deleting object type")
        }
        res.send("object type deleted successfully")
    } );
});
app.get("/citincident-api/informationmasterget/:informationmasterid", async (req, res) => {
    try {
        const { informationmasterid } = req.params;
        // Convert regid to a number
        const informationNumber = parseInt(informationmasterid);

        const sqlGet = "SELECT * FROM informationmaster WHERE informationmasterid = $1";
        const result = await db.query(sqlGet, [informationNumber]);
        res.send(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the object type");
    }
});
app.put("/citincident-api/informationmasterupdate/:informationmasterid", uploadingm.single('image'), (req, res) => {
    const { informationmasterid } = req.params;

    // Access body fields
    const { 
        sector, 
        incidentcategory, 
        incidentname,
        city,
        tagss, 
        informationmastertype, 
        informationdescription // This should contain text and url
    } = req.body;

    // Parse the informationdescription string into an object
    let infoDescription = {};
    try {
        infoDescription = JSON.parse(informationdescription || "{}");
    } catch (err) {
        return res.status(400).json({ error: "Invalid JSON format for informationdescription" });
    }

    // Access the uploaded image path
    const imagePath = req.file ? req.file.filename : ""; // Adjust based on your storage solution

    // Create the formatted informationdescription object with text, url, and imagePath
    const formattedDescription = {
        text: infoDescription.text || "", // Ensure text is set to an empty string if undefined
        url: infoDescription.url || [],   // Ensure url is an array, even if no URLs are provided
        image: imagePath // Store the image path
    };

    // Debug: Log raw incoming tags
    console.log('Raw tags received:', tagss);

    // Ensure tags are properly formatted as a PostgreSQL array
    // Check if tagss is a string; if so, split it into an array
    let tagssArray = Array.isArray(tagss) ? tagss : tagss.split(",");

    // Trim whitespace around each tag
    tagssArray = tagssArray.map(tagi => tagi.trim());

    // Convert tagss to a PostgreSQL-compatible array format
    const formattedTags = `{${tagssArray.join(",")}}`;  // Use curly braces for PostgreSQL array format
    console.log('Formatted tags for database:', formattedTags);

    // Log the received data for debugging
    console.log("Update Request Data:", { sector, incidentcategory, incidentname, city, formattedTags, informationmastertype, formattedDescription });

    // SQL Query for updating record
    const sqlUpdate = `
        UPDATE informationmaster 
        SET 
            sector = $1, 
            incidentcategory = $2, 
            incidentname = $3, 
            city  = $4,
            tagss = $5,
            informationmastertype = $6, 
            informationdescription = $7 
        WHERE 
            informationmasterid = $8
    `;

    const values = [
        sector,
        incidentcategory,
        incidentname,
        city,
        formattedTags, // Use formattedTags instead of tagss
        informationmastertype,
        JSON.stringify(formattedDescription), // Ensure we store the object as a JSON string
        informationmasterid // Include the ID for the WHERE clause
    ];

    // Log the SQL command and values for debugging
    console.log("SQL Update Command:", sqlUpdate);
    console.log("Values to Update:", values);

    // Execute the database query
    db.query(sqlUpdate, values, (error, result) => {
        if (error) {
            console.error("Error updating informationmaster:", error);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Check if the record was found and updated
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Information master not found" });
        }

        // Respond with success
        res.status(200).json({ message: "Information master updated successfully" });
    });
});

// Nodemailer transporter setup
// app.post("/api/send-emailfour/ids", async (req, res) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: "Gmail",
//             auth: {
//                 user: "vaishnavisd23@gmail.com",
//                 pass: "pyxo oadt rfcu lcxg",
//             },
//         });
        
//         const {
//             email1,
//             incidentcategory,
//             incidentname,
//             incidentowner,
//             incidentdescription,
//             date,
//             currentaddress,
//             gps,
//             raisedtouser,
//             status,
//             timeFrame
//         } = req.body;

//         const fromEmail = incidentowner; // Use incidentowner as the from email

//         const mailOptions = {
//             from: fromEmail,
//             to: [email1].filter((email) => email !== ""),
//             subject: `Incident Report: ${incidentname}`,  // Use backticks for template literals
//             text: ` Resolve this incident within 24hrs given time ${timeFrame}timeFrame!!!!

//                 Incident Report: ${incidentname},
                
//                 Incident Category: ${incidentcategory},
//                 Incident name: ${incidentname},
//                 Incident Owner: ${incidentowner},
//                 Description: ${incidentdescription},
//                 Date: ${date},
//                 Current address: ${currentaddress},
//                 GPS: ${gps},
//                 Raised to user: ${raisedtouser},
//                 status: ${status},
//             ` // Use backticks for multi-line template literals
//         };

//         await transporter.sendMail(mailOptions);
//         res.status(200).json({ message: "Email sent successfully" });
//         console.log("Email sent successfully");
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
// Serve static files from the uploads directory


app.post("/citincident-api/send-invite", async (req, res) => {
    try {
        const { email} = req.body;

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "vaishnavisd23@gmail.com",
                pass: "pyxo oadt rfcu lcxg",
            },
        });

        // Create an invite link
        const inviteLink = process.env.BASE_URL;

        const inviteMailOptions = {
            from: "vaishnavisd23@gmail.com",
            to: email,
            subject: 'Invitation to Join Our Platform',
            text: ``,
            html: `<p>Hi,</p>
             <p>It appears that you are not registered with our system. Please use the following link to register and join our platform:</p>
             <a href="${inviteLink}">Join Passion Cyber Intelligence Team (CIT) Incident</a>
             <p>Thank you!</p>`,
        };

        // Send the invitation email
        await transporter.sendMail(inviteMailOptions);

        res.status(200).json({ message: "Invitation email sent successfully." });
    } catch (error) {
        console.error("Error in /api/send-invite:", error);
        res.status(500).json({ error: error.message });
    }
});

// Check if email exists
// app.get('/citincident-api/check-email/:email', async (req, res) => {
//     const { email } = req.params;

//     try {
//         const result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.toLowerCase()]);
//         if (result.rows.length > 0) {
//             res.json({ exists: true });
//         } else {
//             res.json({ exists: false });
//         }
//     } catch (error) {
//         console.error('Error checking email:', error);
//         res.status(500).json({ exists: false, message: 'Server error' });
//     }
// });

app.delete("/citincident-api/userdelete/:id", (req, res) => {
    const {id} = req.params;
    const sqlRemove="DELETE FROM users where id=$1";
    db.query(sqlRemove ,[id],(error,result)=>{
        if(error) {
            console.log(error);
            return res.status(500).send("an error occurred while deleting object type")
        }
        res.send("object type deleted successfully")
    } );
});
// for Admin sert priority
app.post('/citincident-api/set-priority-times', async (req, res) => {
    const { critical, veryhigh, high, medium, low } = req.body;

    // Input validation (optional)
    if (typeof critical !== 'string' || typeof veryhigh !== 'string' ||
        typeof high !== 'string' || typeof medium !== 'string' ||
        typeof low !== 'string') {
        return res.status(400).json({ message: 'Invalid input.' });
    }

    try {
        await db.query(
            `UPDATE priority_times
             SET critical = $1, veryhigh = $2, high = $3, medium = $4, low = $5
             WHERE id = 1`,
            [critical, veryhigh, high, medium, low]
        );
        res.json({ message: 'Priority times updated successfully.' });
    } catch (err) {
        console.error('Error updating priority times:', err);
        res.status(500).json({ message: 'Failed to update priority times.' });
    }
});
app.get('/citincident-api/get-priority-times', async (req, res) => {
    try {
        // Query to fetch priority times
        const result = await db.query('SELECT * FROM priority_times WHERE id = 1');
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Priority times not found' });
        }
    } catch (err) {
        console.error('Error fetching priority times:', err);
        res.status(500).json({ message: 'Failed to fetch priority times' });
    }
});
// // Ensure 'status' column exists
// const ensureStatusColumnExists = async () => {
//     const checkColumnQuery = 
//         SELECT column_name
//         FROM information_schema.columns
//         WHERE table_name='incident' AND column_name='status';
//     ;
//     const result = await db.query(checkColumnQuery);

//     if (result.rows.length === 0) {
//         const addColumnQuery = 
//             ALTER TABLE incident ADD COLUMN status VARCHAR(50) DEFAULT 'Pending';
//         ;
//         await db.query(addColumnQuery);
//         console.log("'status' column added to 'incident' table.");
//     } else {
//         console.log("'status' column already exists in 'incident' table.");
//     }
// };

// // Call the function to ensure the column exists
// ensureStatusColumnExists().catch(error => console.error('Error ensuring status column exists:', error));


// app.get("/api/incidentget", (req, res) => {
//     const sqlGet = "SELECT * FROM incident";
//     db.query(sqlGet, (error, result) => {
//         if (error) {
//             console.error("Error fetching resolutions:", error);
//             return res.status(500).json({ error: "Internal server error" });
//         }
//         res.json(result.rows);
//     });
// });

// app.get('/api/incidentget', authenticateToken, async (req, res) => {
//     try {
//         const userId = req.user.userId; // Get userId from token

//         const result = await db.query(`
//             SELECT 
//                 incident.incidentcategory, 
//                 incident.incidentname, 
//                 incident.incidentowner, 
//                 incident.description, 
//                 incident.date, 
//                 incident.currentaddress, 
//                 incident.gps, 
//                 incident.raisedtouser, 
//                 users.email 
//             FROM 
//                 incident 
//             INNER JOIN 
//                 users 
//             ON 
//                 incident.userid = users.id 
//             WHERE 
//                 incident.userid = $1
//         `, [userId]);

//         if (result.rows.length > 0) {
//             res.json(result.rows);
//         } else {
//             res.status(404).json({ message: 'No incidents found' });
//         }
//     } catch (error) {
//         console.error('Error fetching incidents:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });
// app.get("/api/incidentget", (req, res) => {
//     const sqlGet = `
//         SELECT 
//             i.*,
//             u.email AS user_email
//         FROM 
//             incident i
//         JOIN 
//             users u
//         ON 
//             i.userid = u.id
//     `;
    
//     db.query(sqlGet, (error, result) => {
//         if (error) {
//             console.error("Error fetching incidents:", error);
//             return res.status(500).json({ error: "Internal server error" });
//         }
        
//         // Ensure result.rows is defined
//         if (!result || !result.rows) {
//             console.error("Invalid query result:", result);
//             return res.status(500).json({ error: "Invalid query result" });
//         }

//         // Format the response to group incidents by user email
//         const incidentsByUser = result.rows.reduce((acc, row) => {
//             const { user_email, ...incidentData } = row;

//             if (!acc[user_email]) {
//                 acc[user_email] = [];
//             }

//             acc[user_email].push(incidentData);

//             return acc;
//         }, {});

//         // Send the result as JSON
//         res.json(incidentsByUser);
//     });
// });

app.get("/citincident-api/incidentget", (req, res) => {
    const sqlGet = `
        SELECT
            *
        FROM incident
    `;

    db.query(sqlGet, (error, result) => {
        if (error) {
            console.error("Error fetching incidents:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(result.rows);
    });
});


//add a query


// Middleware to serve static files
app.use('/citincident-api/uploads', express.static('uploads'));
const storagi = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploading = multer({ storage: storagi });

app.post('/citincident-api/incidentpost', uploading.single('photo'), (req, res) => {
    const { 
        sector, 
        incidentcategory, 
        incidentname, 
        incidentowner, 
        incidentdescription, 
        date, 
        currentaddress, 
        gps, 
        raisedtouser, 
        status, 
        tagss, 
        priority, 
        remark 
    } = req.body;

    // Debug: Log raw incoming tags
    console.log('Raw tags received:', tagss);

    // Ensure tags are properly formatted as a PostgreSQL array
    // Check if tagss is a string; if so, split it into an array
    let tagssArray = Array.isArray(tagss) ? tagss : tagss.split(",");

    // Trim whitespace around each tag
    tagssArray = tagssArray.map(tagi => tagi.trim());

    // Convert tagss to a PostgreSQL-compatible array format
    const formattedTags = `{${tagssArray.join(",")}}`;  // Use curly braces for PostgreSQL array format


    // Extract the filename from the uploaded file
    const photo = req.file ? req.file.filename : null;

    // Debug: Log the unique tags and the formatted version
    
    console.log('Formatted tags for database:', formattedTags);

    // Insert data into the database
    const sqlInsert = `
        INSERT INTO incident (
            sector, incidentcategory, incidentname, incidentowner, incidentdescription, 
            date, currentaddress, gps, raisedtouser, status, 
            tagss, priority, remark, photo
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;
    const values = [sector, incidentcategory, incidentname, incidentowner, incidentdescription, date, currentaddress, gps, raisedtouser, status, formattedTags, priority, remark, photo];

    db.query(sqlInsert, values, (error, result) => {
        if (error) {
            console.error("Error inserting incident:", error);
            res.status(500).json({ error: "Internal server error" });
        } else {
            res.status(200).json({ message: "Incident inserted successfully" });
        }
    });
});

app.post("/citincident-api/send-incident-email", uploading.single('photo'), async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "vaishnavisd23@gmail.com",
                pass: "pyxo oadt rfcu lcxg",
            },
        });
         // Create an invite link
         const inviteLink = process.env.BASE_URL;
        const {
            email1,
            sector,
            incidentcategory,
            incidentname,
            incidentowner,
            incidentdescription,
            date,
            currentaddress,
            gps,
            raisedtouser,
            status,
            priority,
            remark,
        } = req.body;

        // Fetch priority times from the database
        const priorityResult = await db.query('SELECT * FROM priority_times WHERE id = 1');
        const priorityTimes = priorityResult.rows[0];
        const timeFrame = priorityTimes[priority] || "24 hours"; // Default to "24 hours" if priority is not found

        // If a file was uploaded, use its path and name
        const filePath = req.file ? req.file.path : null;
        const fileName = req.file ? req.file.filename : null;

        // Send the incident report email directly
        const mailOptions = {
            from: incidentowner,
            to: email1,
            subject: `Incident Report: ${incidentname}`,
            html: `
                <p>Resolve this incident within the given time frame: <strong>${timeFrame}</strong>.</p>
                <p>To solve this incident, <a href="${inviteLink}signup"> Join Passion Cyber Intelligence Team (CIT) Incident Framework</a>.</p>
                <h3>Incident Report: ${incidentname}</h3>
                <p><strong>Sector:</strong> ${sector}</p>
                <p><strong>Incident Category:</strong> ${incidentcategory}</p>
                <p><strong>Incident Name:</strong> ${incidentname}</p>
                <p><strong>Incident Owner:</strong> ${incidentowner}</p>
                <p><strong>Description:</strong> ${incidentdescription}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Current Address:</strong> ${currentaddress}</p>
                <p><strong>GPS:</strong> ${gps}</p>
                <p><strong>Raised to User:</strong> ${raisedtouser}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Priority:</strong> ${priority}</p>
                <p><strong>Remarks:</strong> ${remark}</p>
            `,
            attachments: filePath ? [
                {
                    filename: fileName, // The uploaded file's name
                    path: filePath,     // The uploaded file's path
                    cid: 'incidentphoto@incidentemail'
                }
            ] : [] // No attachments if no file uploaded
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Incident email sent successfully." });
    } catch (error) {
        console.error("Error in /citincident-api/send-incident-email:", error);
        res.status(500).json({ error: error.message });
    }
});



/******delete *******/
app.delete("/citincident-api/incidentdelete/:incidentid", (req, res) => {
    const {incidentid} = req.params;
    const sqlRemove="DELETE FROM incident where incidentid=$1";
    db.query(sqlRemove ,[incidentid],(error,result)=>{
        if(error) {
            console.log(error);
            return res.status(500).send("an error occurred while deleting object type")
        }
        res.send("object type deleted successfully")
    } );
});

app.put('/citincident-api/incidentupdate/:incidentid', uploading.single('photo'), (req, res) => {
    const { 
        sector, 
        incidentcategory, 
        incidentname, 
        incidentowner, 
        incidentdescription, 
        date, 
        currentaddress, 
        gps, 
        raisedtouser, 
        status, 
        tagss, 
        priority, 
        remark 
    } = req.body;

    // Handle tags formatting
    let tagssArray = Array.isArray(tagss) ? tagss : tagss.split(",").map(t => t.trim());
    const formattedTags = `{${tagssArray.join(",")}}`;  // PostgreSQL array format

    // Extract the filename from the uploaded file
    const photo = req.file ? req.file.filename : null;

    // Log for debugging
    console.log('Formatted tags for database:', formattedTags);
    console.log('Photo received for update:', photo);

    // Create the SQL UPDATE query
    const sqlUpdate = `
        UPDATE incident 
        SET 
            sector = $1, 
            incidentcategory = $2, 
            incidentname = $3, 
            incidentowner = $4, 
            incidentdescription = $5, 
            date = $6, 
            currentaddress = $7, 
            gps = $8, 
            raisedtouser = $9, 
            status = $10, 
            tagss = $11, 
            priority = $12, 
            remark = $13,
            photo = COALESCE($14, photo)  -- Keep existing photo if no new photo is uploaded
        WHERE incidentid = $15
    `;

    // Prepare the values for the SQL query
    const values = [
        sector,
        incidentcategory,
        incidentname,
        incidentowner,
        incidentdescription,
        date,
        currentaddress,
        gps,
        raisedtouser,
        status,
        formattedTags,
        priority,
        remark,
        photo,  // Will be null if no new photo is uploaded
        req.params.incidentid
    ];

    // Execute the query
    db.query(sqlUpdate, values, (error, result) => {
        if (error) {
            console.error("Error updating incident:", error);
            res.status(500).json({ error: "Internal server error" });
        } else {
            res.status(200).json({ message: "Incident updated successfully" });
        }
    });
});

app.get("/citincident-api/incidentget/:incidentid", async (req, res) => {
    try {
        const { incidentid } = req.params;
        // Convert regid to a number
        const incidentidNumber = parseInt(incidentid);

        const sqlGet = "SELECT * FROM incident WHERE incidentid = $1";
        const result = await db.query(sqlGet, [incidentidNumber]);
        res.send(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the object type");
    }
});
// Assume you have a `users` table with a `userid` and `email` column
app.get("/citincident-api/getUserByEmail/:email", (req, res) => {
    const email = req.params.email;
    const sqlSelect = "SELECT id FROM users WHERE email = $1";

    db.query(sqlSelect, [email], (error, result) => {
        if (error) {
            console.error("Error fetching user by email:", error);
            res.status(500).json({ error: "Internal server error" });
        } else {
            if (result.rows.length > 0) {
                res.status(200).json({ userid: result.rows[0].id });
            } else {
                res.status(404).json({ error: "User not found" });
            }
        }
    });
});
//fetch tags
app.get('/citincident-api/tags', (req, res) => {
    const sqlGet = "SELECT tagss FROM incident";
    db.query(sqlGet, (error, result) => {
        if (error) {
            console.error("Error fetching tags:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        
        // Check if result.rows is not null and has data
        if (result.rows && result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.json([]); // Return an empty array if no data
        }
    });
});

app.post('/citincident-api/set-priority-times', async (req, res) => {
    const { critical, veryhigh, high, medium, low } = req.body;

    // Input validation (optional)
    if (typeof critical !== 'string' || typeof veryhigh !== 'string' ||
        typeof high !== 'string' || typeof medium !== 'string' ||
        typeof low !== 'string') {
        return res.status(400).json({ message: 'Invalid input.' });
    }

    try {
        await db.query(
            `UPDATE priority_times
             SET critical = $1, veryhigh = $2, high = $3, medium = $4, low = $5
             WHERE id = 1`,
            [critical, veryhigh, high, medium, low]
        );
        res.json({ message: 'Priority times updated successfully.' });
    } catch (err) {
        console.error('Error updating priority times:', err);
        res.status(500).json({ message: 'Failed to update priority times.' });
    }
});

// app.post('/citincident-api/transliterate', async (req, res) => {
//     const { text, languageCode } = req.body;

//     try {
//         const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY`, {
//             q: text,
//             target: languageCode,
//             format: 'text'
//         });
//         res.json({ transliteratedText: response.data.data.translations[0].translatedText });
//     } catch (error) {
//         console.error('Error during transliteration:', error);
//         res.status(500).send('Error during transliteration');
//     }
// });
// app.put("/api/incidentupdate/:incidentid", (req, res) => {
//     const {incidentid} = req.params;
//     const {incidentcategory,incidentname,incidentowner,description,date,currentaddress,gps,raisedtouser} = req.body;
     
//     const sqlUpdate="UPDATE incident SET incidentcategory=$1, incidentname=$2, incidentowner=$3, description=$4, date=$5, currentaddress=$6, gps=$7, raisedtouser=$8, WHERE incidentid=$9";
//     db.query(sqlUpdate,[incidentcategory,incidentname,incidentowner,description,date,currentaddress,gps,raisedtouser,incidentid],(error,result)=>{
//         if (error) {
//             console.error("error inserting object type",error);
//            return res.status(500).send("an error occurred while updating the object type");
//     }
//         res.send("object type updated sucessfully");
// });
// });

// // Endpoint to send email
// app.post("/api/send-email", async (req, res) => {
//     const { recipientEmail, subject, text } = req.body;

//     try {
//         await sendEmail(recipientEmail, subject, text);
//         res.status(200).json({ message: "Email sent successfully" });
//     } catch (error) {
//         console.error("Error sending email:", error);
//         res.status(500).json({ error: "Failed to send email" });
//     }
// });

//--------Resolution---------------
// Resolution Routes
app.get("/citincident-api/resolutionget", (req, res) => {
    const sqlGet = "SELECT * FROM resolution";
    db.query(sqlGet, (error, result) => {
        if (error) {
            console.error("Error fetching resolutions:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(result.rows);
    });
});
app.get("/citincident-api/adminresolutionget", (req, res) => {
    const sqlGet = `
        SELECT 
            r.incidentid,
            r.sector,
            r.incidentcategory,
            r.incidentname,
            r.incidentowner,
            r.resolutiondate,
            r.resolutionid,
            r.resolutionremark,
            r.resolvedby,
            a.email, a.name AS user
        FROM users a
        JOIN resolution r ON a.id = r.id
    `;

    db.query(sqlGet, (error, result) => {
        if (error) {
            console.error("Error fetching resolutions not in incidents:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json(result.rows);
    });
});




// app.post("/api/resolutionpost", (req, res) => {
//     const { incidentid,incidentcategory,incidentname,incidentowner,resolutiondate, resolutionremark, resolvedby } = req.body;
//     const sqlInsert = "INSERT INTO resolution (incidentid,incidentcategory, incidentname, incidentowner, resolutiondate, resolutionremark, resolvedby) VALUES ($1, $2, $3, $4, $5, $6, $7)";
//     const values = [incidentid,incidentcategory, incidentname, incidentowner,resolutiondate, resolutionremark, resolvedby]
//     db.query(sqlInsert, values, (error, result) => {
//         if (error) {
//             console.error("Error inserting resolution:", error);
//             return res.status(500).json({ error: "Internal server error" });
//         }
//         res.status(200).json({ message: "Resolution inserted successfully" });
//     });
// });

// Endpoint to check if an incident is resolved
app.get("/citincident-api/check-resolution-status/:incidentid", (req, res) => {
    const { incidentid } = req.params;

    // Query to check the resolution table for the incident ID
    const sqlCheck = "SELECT EXISTS(SELECT 1 FROM resolution WHERE incidentid = $1) AS exists";
    
    db.query(sqlCheck, [incidentid], (error, result) => {
        if (error) {
            console.error("Error checking resolution status:", error);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Check if the incident exists in the resolution table
        const incidentExists = result.rows[0].exists;

        // Send response based on the check
        if (incidentExists) {
            // Update the resolved status in the incidents table
            const sqlUpdate = "UPDATE incident SET resolved = TRUE WHERE incidentid = $1";
            db.query(sqlUpdate, [incidentid], (error) => {
                if (error) {
                    console.error("Error updating resolved status:", error);
                    return res.status(500).json({ error: "Internal server error" });
                }
                return res.json({ resolved: true });
            });
        } else {
            return res.json({ resolved: false });
        }
    });
});

app.post("/citincident-api/resolutionpost", (req, res) => {
    const {
        incidentid,
        sector,
        incidentcategory,
        incidentname,
        incidentowner,
        resolutiondate,
        resolutionremark,
        resolvedby,
        id // Ensure this is properly defined if needed
    } = req.body;

    // Basic validation
    if (!incidentid || !sector || !incidentcategory || !incidentname || !incidentowner || !resolutiondate || !resolutionremark || !resolvedby) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the incident already exists in the resolution table
    const sqlCheck = "SELECT EXISTS(SELECT 1 FROM resolution WHERE incidentid = $1) AS exists";
    db.query(sqlCheck, [incidentid], (checkError, checkResult) => {
        if (checkError) {
            console.error("Error checking resolution:", checkError);
            return res.status(500).json({ error: "Internal server error" });
        }

        // If incident already has a resolution
        if (checkResult.rows[0].exists) {
            return res.status(400).json({ error: "This incident ID already has a resolution." });
        }

        // SQL Insert query (update as needed)
        const sqlInsert = "INSERT INTO resolution (incidentid, sector, incidentcategory, incidentname, incidentowner, resolutiondate, resolutionremark, resolvedby, id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
        const values = [incidentid, sector, incidentcategory, incidentname, incidentowner, resolutiondate, resolutionremark, resolvedby, id]; // Ensure id is included if necessary

        // Execute the insert query
        db.query(sqlInsert, values, (insertError) => {
            if (insertError) {
                console.error("Error inserting resolution:", insertError);
                return res.status(500).json({ error: "Internal server error" });
            }

            // Update resolved status in the incidents table
            const sqlUpdate = "UPDATE incident SET resolved = TRUE WHERE incidentid = $1";
            db.query(sqlUpdate, [incidentid], (updateError) => {
                if (updateError) {
                    console.error("Error updating incident status:", updateError);
                    return res.status(500).json({ error: "Internal server error" });
                }

                // Successfully inserted resolution and updated the incident
                return res.status(200).json({ message: "Resolution inserted successfully, incident marked as resolved." });
            });
        });
    });
});



app.delete("/citincident-api/resolutiondelete/:resolutionid", (req, res) => {
    const { resolutionid } = req.params;
    const sqlRemove = "DELETE FROM resolution WHERE resolutionid = $1";
    db.query(sqlRemove, [resolutionid], (error, result) => {
        if (error) {
            console.error("Error deleting resolution:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json({ message: "Resolution deleted successfully" });
    });
});

// app.get("/api/incidentget/:incidentid", (req, res) => {
//     const {incidentid} = req.params;
//     const sqlGet = "SELECT * FROM incident WHERE incidentid = $1";
//     db.query(sqlGet, [incidentid], (error, result) => {
//         if (error) {
//             console.error("Error fetching resolution:", error);
//             return res.status(500).json({ error: "Internal server error" });
//         }
//         res.json(result.rows);
//     });
// });
app.get("/citincident-api/incidentget/:incidentid", (req, res) => {
    const { incidentid } = req.params;

    if (!incidentid) {
        console.error("No Incident ID provided");
        return res.status(400).json({ error: "Incident ID is required" });
    }

    const sqlGet = "SELECT * FROM incident WHERE incidentid = $1";
    console.log(`Executing SQL: ${sqlGet} with params: ${incidentid}`);

    db.query(sqlGet, [incidentid], (error, result) => {
        if (error) {
            console.error("Error fetching incident:", error);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Incident not found" });
        }

        res.json(result.rows);
    });
});


app.put("/citincident-api/resolutionupdate/:resolutionid", (req, res) => {
    const { resolutionid } = req.params;
    const { resolutiondate, resolutionremark, resolvedby } = req.body;
    const sqlUpdate = "UPDATE resolution SET resolutiondate = $1, resolutionremark = $2, resolvedby = $3 WHERE resolutionid = $4";
    const values = [resolutiondate, resolutionremark, resolvedby, resolutionid];
    db.query(sqlUpdate, values, (error, result) => {
        if (error) {
            console.error("Error updating resolution:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json({ message: "Resolution updated successfully" });
    });
});
app.post("/citincident-api/send-emailforresolved", async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "vaishnavisd23@gmail.com",
                pass: "pyxo oadt rfcu lcxg",
            },
        });

        const {
            email1,
            incidentid,
            sector,
            incidentcategory,
            incidentname,
            incidentowner,
            resolutiondate,
            resolutionremark,
            resolvedby
        } = req.body;

        const fromEmail = resolvedby; // Use resolvedby as the from email

        const mailOptions = {
            from: fromEmail,
            to: [email1].filter(email => email !== ""),
            subject: `The Incident Resolved Report: ${incidentname}`,
            html: `
                <html>
                    <body>
                        <h2>Incident Resolved Report</h2>
                        <p>This Query has been resolved by <strong>${resolvedby}</strong></p>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px;">Field</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Details</th>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">Incident ID</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${incidentid}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">Sector</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${sector}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">Incident Category</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${incidentcategory}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">Incident Name</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${incidentname}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">Incident Owner</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${incidentowner}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">Resolution Date</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${resolutiondate}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">Resolution Remark</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${resolutionremark}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">Resolved By</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${resolvedby}</td>
                            </tr>
                        </table>
                    </body>
                </html>
            `
        };
        

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent successfully" });
        console.log("Email sent successfully");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Admin dashboard
app.get('/citincident-api/incidentsuser-count', async (req, res) => {
    try {
      const results = await db.query(`
       SELECT incidentowner AS email, incidentid, COUNT(incidentid) AS incident_count
FROM incident
WHERE incidentowner IS NOT NULL  
GROUP BY incidentid

      `);
      res.json(results.rows);  // Return the result as JSON
    } catch (error) {
      console.error('Error fetching incident counts by user:', error);
      res.status(500).send('Server Error');
    }
  });
  

  app.get('/citincident-api/resolution-statuses', async (req, res) => {
    try {
      // Fetch resolutions based on users
      const result = await pool.query(`
        SELECT
          resolution_status,
          COUNT(*) AS count
        FROM
          resolution
        GROUP BY
          resolution_status
        ORDER BY
          resolution_status
      `);
      
      // Send the result as JSON
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching resolution data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/citincident-api/priority', (req, res) => {
    // SQL query to get incidents with priority and user info, joining based on raisedtouser email
    const sqlGet = `
      SELECT
        i.priority,
        u.email AS user,
        COUNT(*) AS count
      FROM incident i
      JOIN users u ON i.raisedtouser = u.email  -- Join based on raisedtouser email
      GROUP BY i.priority, u.email
      ORDER BY i.priority, u.email;
    `;
  
    db.query(sqlGet, (error, result) => {
      if (error) {
        console.error('Error fetching incident priority data:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      // Format data to match frontend expectations
      const formattedResult = result.rows.map(row => ({
        priority: row.priority,
        user: row.user,
        count: parseInt(row.count, 10)
      }));
  
      res.status(200).json(formattedResult);
    });
  });
  
  app.get('/citincident-api/trends', async (req, res) => {
    try {
      // SQL query to fetch trends with category and priority
      const sqlQuery = `
        SELECT 
          c.incidentcategory AS category, 
          i.priority, 
          COUNT(*) AS count
        FROM 
          incident i
        JOIN 
          agroincidentcategorym c ON i.incidentid = c.incidentcategoryid
        GROUP BY 
          c.incidentcategory, i.priority
        ORDER BY 
          count DESC;
      `;
  
      const result = await db.query(sqlQuery);
  
      // Prepare data for the frontend
      const trends = result.rows.map(row => ({
        category: row.category, // Ensure this matches the alias used in SQL query
        priority: row.priority,
        count: parseInt(row.count, 10), // Ensure count is a number
      }));
  
      res.json(trends);
  
    } catch (err) {
      console.error('Error fetching incident trends:', err);
      res.status(500).send('Server error');
    }
  });

  //Ctaegories data (case study)
  app.get('/citincident-api/incidents/count', async (req, res) => {
    const { sectorName } = req.query; // Change from 'category' to 'sectorName'

    try {
        // Make sure the 'sector' column matches your database schema
        const query = 'SELECT COUNT(*) AS count FROM incident WHERE sector = $1'; 
        const result = await db.query(query, [sectorName]);
        const totalCount = result.rows[0].count;

        res.json({ count: totalCount });
    } catch (error) {
        console.error("Error fetching incident count:", error);
        res.status(500).json({ error: "An error occurred while fetching the incident count." });
    }
});

// Endpoint to get total resolutions by category
app.get('/citincident-api/resolutions/count', async (req, res) => {
    const { sectorName } = req.query;

    try {
        // Make sure the 'sector' column matches your database schema
        const query = 'SELECT COUNT(*) AS count FROM resolution WHERE sector = $1'; 
        const result = await db.query(query, [sectorName]);
        const totalCount = result.rows[0].count;

        res.json({ count: totalCount });
    } catch (error) {
        console.error("Error fetching incident count:", error);
        res.status(500).json({ error: "An error occurred while fetching the incident count." });
    }
});
app.get('/citincident-api/incidentsd', async (req, res) => {
    const { sectorName } = req.query; // Get the sectorName from the query parameters

    try {
        // Replace 'incidents' with your actual incidents table name
        const query = 'SELECT * FROM incident WHERE sector = $1'; 
        const result = await db.query(query, [sectorName]);
        
        res.json(result.rows); // Return the incidents as a JSON response
    } catch (error) {
        console.error("Error fetching incidents:", error);
        res.status(500).json({ error: "An error occurred while fetching incidents." });
    }
});
// Example using Express.js
app.get('/citincident-api/incidentcategoriessec', async (req, res) => {
    const { sectorName } = req.query;

    try {
        // Use 'incidentcategory' which is the correct column name
        const query = `
            SELECT DISTINCT incidentcategory 
            FROM agroincidentcategorym
            WHERE sector = $1
        `;
        const result = await db.query(query, [sectorName]);

        const categories = result.rows.map(row => row.incidentcategory); // Use incidentcategory
        res.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
});



  app.get('/citincident-api/locations', async (req, res) => {
    try {
      const sqlQuery = `
        SELECT
          i.incidentid,
          i.incidentcategory,
          i.incidentdescription,
          i.currentaddress,
          i.gps,
          u.email
        FROM
          incident i
        JOIN
          users u ON i.id = u.id;
      `;
  
      const result = await db.query(sqlQuery);
  
      // Format the result
      const incidents = result.rows.map(row => {
        const [latitude, longitude] = row.gps.split(',').map(coord => parseFloat(coord.trim()));
        return {
          id: row.incidentid,
          category: row.incidentcategory,
          description: row.incidentdescription,
          currentaddress: row.currentaddress,
          latitude: latitude,
          longitude: longitude,
          email: row.email,
        };
      });
  
      res.status(200).json(incidents);
    } catch (error) {
      console.error('Error fetching incident location data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });
  

app.listen(5017,()=>{
    console.log("server is running on port 5017");
})


// "server1": "node server1/index.js",
    // "server2": "node server2/form.js",
    // "server3": "node server3/group.js",
    // "server": "npm run server1 & npm run server2 & npm run server3