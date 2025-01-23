const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://jainishrupala:Jainish18@cluster0.kjg89.mongodb.net/email?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Canvas Schema
const canvasSchema = new mongoose.Schema({
    elements: Array,
    styles: String, // Add this field
    name: String,
    createdAt: { type: Date, default: Date.now },
  });
  

const Canvas = mongoose.model('Canvas', canvasSchema);

// Routes
app.post('/api/canvas', async (req, res) => {
    try {
        const newCanvas = new Canvas(req.body);
        await newCanvas.save();
        res.status(201).json(newCanvas);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/canvas', async (req, res) => {
    try {
        const canvases = await Canvas.find();
        res.json(canvases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get('/api/canvas/:id', async (req, res) => {
    try {
        const project = await Canvas.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.put('/api/canvas/:id', async (req, res) => {
    try {
        const canvas = await Canvas.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(canvas);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/canvas/:id', async (req, res) => {
    try {
        await Canvas.findByIdAndDelete(req.params.id);
        res.json({ message: 'Canvas deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});