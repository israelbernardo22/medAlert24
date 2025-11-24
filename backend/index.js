
const express = require('express');
const cors = require('cors');

// Wrap the application in an async function to allow for dynamic imports
async function startServer() {
    // Dynamically import ES Modules
    const { Low } = await import('lowdb');
    const { JSONFile } = await import('lowdb/node');
    const short = (await import('short-uuid')).default;

    // Set up the lowdb database
    const adapter = new JSONFile('db.json');
    const defaultData = { users: [], families: [], medications: [] };
    const db = new Low(adapter, defaultData);

    // Read data from db.json
    await db.read();
    db.data = db.data || defaultData;
    await db.write();

    const app = express();
    const port = process.env.PORT || 3001;

    app.use(cors());
    app.use(express.json());

    // --- User Authentication ---

    // Register a new user
    app.post('/api/auth/register', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ message: 'Email and password are required' });
        }

        try {
            // Check if user already exists
            const existingUser = db.data.users.find(user => user.email === email);
            if (existingUser) {
                return res.status(409).send({ message: 'User with this email already exists' });
            }

            // In a real app, you would hash and salt the password. Storing it in plaintext is insecure.
            const newUser = { id: short.generate(), email, password };
            db.data.users.push(newUser);
            
            // Create a corresponding family for the user
            // We use the user's ID as the family's ID for easy mapping
            const newFamily = { id: newUser.id, profiles: [] };
            db.data.families.push(newFamily);

            await db.write();

            console.log('User registered:', { id: newUser.id, email });
            res.status(201).send({ id: newUser.id, email });
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).send({ message: 'Error registering user' });
        }
    });

    // Login a user
    app.post('/api/auth/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ message: 'Email and password are required' });
        }

        try {
            // This is insecure. Passwords should be hashed.
            const user = db.data.users.find(u => u.email === email && u.password === password);

            if (!user) {
                return res.status(401).send({ message: 'Invalid credentials' });
            }
            
            console.log('User logged in:', {id: user.id, email: user.email});
            res.send({ id: user.id, email: user.email });

        } catch (error) {
            console.error("Error logging in user:", error);
            res.status(500).send({ message: 'Error logging in user' });
        }
    });

    // --- Family and Profiles ---

    // Get a user's family and profiles
    app.get('/api/family/:userId', async (req, res) => {
        const { userId } = req.params;

        try {
            const family = db.data.families.find(f => f.id === userId);

            if (family) {
                res.send(family);
            } else {
                res.status(404).send({ message: 'Family not found' });
            }
        } catch (error) {
            console.error("Error getting family:", error);
            res.status(500).send({ message: 'Error getting family data' });
        }
    });

    // Add a profile to a family
    app.post('/api/family/:userId/profiles', async (req, res) => {
        const { userId } = req.params;
        const { name, relation } = req.body;

        try {
            const family = db.data.families.find(f => f.id === userId);

            if (!family) {
                return res.status(404).send({ message: 'Family not found' });
            }

            const newProfile = {
                id: short.generate(),
                name,
                relation,
            };

            family.profiles.push(newProfile);
            await db.write();
            
            console.log('Added profile to family:', newProfile);
            res.status(201).send(newProfile);
        } catch (error) {
            console.error("Error adding profile:", error);
            res.status(500).send({ message: 'Error adding profile' });
        }
    });

    // --- Medications ---
    app.post('/api/medications', async (req, res) => {
        const medicationData = req.body;
        if (!medicationData || Object.keys(medicationData).length === 0) {
            return res.status(400).json({ message: 'Medication data cannot be empty' });
        }

        try {
            const newMedication = { id: short.generate(), ...medicationData };
            db.data.medications.push(newMedication);
            await db.write();

            console.log('Added medication:', newMedication);
            res.status(201).json(newMedication);
        } catch (error) {
            console.error("Error adding medication:", error);
            res.status(500).send({ message: 'Error adding medication' });
        }
    });

    app.listen(port, () => {
        console.log(`Backend server listening at http://localhost:${port}`);
    });
}

startServer();
