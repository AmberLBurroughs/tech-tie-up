
module.exports = function(sequelize, DataTypes) {
  var Category = sequelize.define("Category", {
    
    title: {
      type: DataTypes.STRING,
      allowNull: false      
    },
    
    route: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

   Category.associate = function(models) {
    // Associating Author with Posts
    // When a category is deleted, also delete any associated Posts
    Category.hasMany(models.Post, {
      onDelete: "cascade"
    });
  };

  return Category;
};

