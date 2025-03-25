app.put('/api/goats/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    await db.update(goats)
      .set(data)
      .where(eq(goats.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating goat:', error);
    res.status(500).json({ 
      error: 'Failed to update goat',
      details: error.message 
    });
  }
});