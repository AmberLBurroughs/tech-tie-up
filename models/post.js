module.exports = function(sequelize, DataTypes) {
  var Post = sequelize.define("Post", {

   title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        max: 50
      }
    },

    body: {
      type: DataTypes.TEXT,
      allowNull: false      
    },

    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    createdAtStr: {
      type: DataTypes.TEXT,
      allowNull: false     
    },

    newsUrl: {
      type: DataTypes.TEXT
    }


  });

  Post.associate = function(models) {
    // We're saying that a Post should belong to an Author
    // A Post can't be created without an Author due to the foreign key constraint
    Post.belongsTo(models.User, {
      foreignKey: {
        //allowNull: false
      }
    });

    Post.belongsTo(models.Category, {
      foreignKey: {
        //allowNull: false
      }
    });

    Post.hasMany(models.Comment, {
      onDelete: "cascade"
    });
  };

   return Post;
};