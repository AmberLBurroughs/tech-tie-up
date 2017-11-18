var bcrypt   = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define("User", {
    
    username: {
      type: DataTypes.STRING,
      required: true
    },

    email:{
      type: DataTypes.STRING,
      required: true
    },

    fullname: {
      type: DataTypes.STRING,
    },

    image: {
      type: DataTypes.STRING,
      defaultValue: "/assets/uploads/tie-up.png" 
    },

    interests: {
      type: DataTypes.TEXT,   
    },

    saved: {
      type: DataTypes.STRING,   
    },  

    location: {
      type: DataTypes.STRING,   
    },      

    private: {
      type: DataTypes.BOOLEAN,
      defaultValue: true 
    },

    localPassword: {
      type: DataTypes.STRING,
      required: true
    }

  }); 

  // methods ======================
  // generating a hash
  User.generateHash = function(password) {
      return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
  User.prototype.validPassword = function(password) {
      return bcrypt.compareSync(password, this.localPassword);
  };

  User.associate = function(models) {
    // Associating User with Posts
    // When an User is deleted, also delete any associated Posts
    User.hasMany(models.Post, {
      onDelete: "cascade"
    }); 

  };

  return User;
};