const Sequelize = require('sequelize');
const { STRING, INTEGER, ENUM, UUID, UUIDV4 } = Sequelize;
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/fashion_db');
const express = require('express');
const app = express();

//////////////////////////

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

//////////////////////////

const Brand = db.define('brand', {
  name: {
    type: STRING,
    allowNull: false,
  },
  brand_type: {
    type: ENUM('FASHION', 'HIGH FASHION', 'STREETWEAR', 'FAST FASHION'),
    defaultValue: 'FASHION',
    allowNull: false,
  }
})

const Clothing = db.define('clothing', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  name: {
    type: STRING,
    allowNull: false,
  },
  size: {
    type: ENUM('XS', 'S', 'M', 'L', 'XL'),
    allowNull: false,
  },
  price: {
    type: INTEGER,
    allowNull: true,
  }
})

Clothing.belongsTo(Brand, { as: 'parent' });
Brand.hasMany(Clothing, { as: 'children', foreignKey: 'parentId'})

//////////////////////////

const syncAndSeed = async() => {
  await db.sync({ force: true });
  const [undercover, supreme, uniqlo, margiela, tee, jacket, pants, shoes] = await Promise.all([
    Brand.create({name: 'undercover', brand_type: 'HIGH FASHION'}),
    Brand.create({name: 'supreme', brand_type: 'STREETWEAR'}),
    Brand.create({name: 'uniqlo', brand_type: 'FAST FASHION'}),
    Brand.create({name: 'margiela', brand_type: 'HIGH FASHION'}),
    Clothing.create({name: 'tee', size: 'M', price: 1200}),
    Clothing.create({name: 'jacket', size: 'XL'}),
    Clothing.create({name: 'pants', size: 'S', price: 60}),
    Clothing.create({name: 'shoes', size: 'M'}),
  ])

  tee.parentId = undercover.id;
  await undercover.save();
  jacket.parentId = supreme.id; 
  await supreme.save();
  pants.parentId = uniqlo.id;
  await uniqlo.save();
  shoes.parentId = margiela.id;
  await margiela.save();

}


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