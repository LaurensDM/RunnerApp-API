const express = require('express');
const { getHandler, postHandler, deleteHandler, putHandler } = require('../service/route');
const router = express.Router();

// GET request
router.get('/', (req, res) => {
    getHandler(req, res);
});

// POST request
router.post('/', (req, res) => {
    postHandler(req, res);
});

// PUT request
router.put('/:id', (req, res) => {
    putHandler(req, res);
});

// DELETE request
router.delete('/:id', (req, res) => {
    deleteHandler(req, res);
});

module.exports = router;