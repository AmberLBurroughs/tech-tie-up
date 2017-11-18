module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define("Comment", {

    
    content: {
      type: DataTypes.TEXT,         
    },

    status: {
      type: DataTypes.STRING,         
    },

    likes: {
      type: DataTypes.INTEGER,         
    }

  });

   Comment.associate = function(models) {
    // Associating Author with Posts
    // When a category is deleted, also delete any associated Posts
    Comment.belongsTo(models.Post, {
      foreignKey: {
      allowNull: false
      }
    });

    Comment.belongsTo(models.User, {
      foreignKey: {
      allowNull: false
      }
    });

  };

  return Comment;
};