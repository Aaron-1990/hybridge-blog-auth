'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    static associate(models) {
      Author.hasMany(models.Post, {
        foreignKey: 'authorId',
        as: 'posts',
      });
    }
  }
  Author.init(
    {
      name: DataTypes.STRING,
      bio: DataTypes.TEXT,
      birthdate: DataTypes.DATE,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Author',
      paranoid: true,
    }
  );
  return Author;
};
