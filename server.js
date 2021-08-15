const { db, syncAndSeed, models: { Brand, Clothing } } = require('./db');
const express = require('express');
const app = express();

app.get('/api/brands', async(req, res, next) => {
  try {
    res.send(await Brand.findAll({
      include: {
        model: Clothing,
        as: 'children',
      }
    }));
  }
  catch (err) {
    next(err)
  }
});

app.get('/api/clothing', async(req, res, next) => {
  try {
    res.send(await Clothing.findAll());
  }
  catch (err) {
    next(err)
  }
});

const init = async() => {
  try {
    await db.authenticate();
    await syncAndSeed();
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  }
  catch (err)  {
    console.log(err);
  }
}

init();