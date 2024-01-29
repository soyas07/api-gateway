import express from 'express';
import { authenticate } from '../middlewares.js';
import { promisify } from 'util';
import fs from 'fs';

const router = express.Router();

const writeFileAsync = promisify(fs.writeFile);
const REGISTRY_FILE = `registry.json`;

router.post('/register', authenticate(['admin']), async (req, res) => {
    const service = req.body;

    if (!service)
        return res.status(400).json({ error: "Service name not provided" });

    try {
        const registry = await loadRegistry();

        // Register the new service
        const newServices = {
            "services": {
                ...registry.services,
                ...service
            }
        }

        // Save the updated registry to the file
        await saveRegistry(newServices);

        res.status(200).json({ message: 'Service registered successfully' });
    } catch (error) {
        console.error('Error registering service:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const loadRegistry = async () => {
    try {
        const registryData = await fs.promises.readFile(REGISTRY_FILE, 'utf8');
        return JSON.parse(registryData);
    } catch (error) {
        // If the file doesn't exist or there's an error, return an empty object
        return {};
    }
}

const saveRegistry = async (registry) => {
    await writeFileAsync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
};


export default router;
