const Sequelize = require('sequelize');
const { STRING, INTEGER, ENUM, UUID, UUIDV4 } = Sequelize;
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/fashion_db');

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
  jacket.parentId = supreme.id; 
  pants.parentId = uniqlo.id;
  shoes.parentId = margiela.id;
  await Promise.all([
    await tee.save(),
    await jacket.save(),
    await pants.save(),
    await shoes.save(),
  ])
};

module.exports = {
  db,
  syncAndSeed,
  models: {
    Brand,
    Clothing,
  }
}