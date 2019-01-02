const mongoose = require('mongoose');
const redis = require('redis');
const keys = require('../config/keys');
const client = redis.createClient(keys.redisUrl);
const util = require('util');
client.get =  util.promisify(client.get);
const  exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function () {
  console.log("FROM CACHE !!!");
  this.useCache = true;
  return this;
}



mongoose.Query.prototype.exec = async function () {

  // si le client n'invoque pas la method .cache()
  if (!this.useCache) {
    console.log("FROM MONGO !!!!");
    return exec.apply(this,arguments);
  }

  const key = JSON.stringify(Object.assign({}, this.getQuery(),{
    collection : this.mongooseCollection.name
  }));

  //Regarder est ce qu'on à la valeur pour 'key' dans redis
  const cachedValue = await client.get(key);

  // Si oui, retourner la valeur dans le cache
  if (cachedValue) {
      const doc = JSON.parse(cachedValue);
      
      return Array.isArray(doc) 
        ? doc.map((d)=> new this.model(d))
        : new this.model(doc);
  }

  // Autrement , executer la requete et enregistrer la valeur dans redis
  const result = await exec.apply(this, arguments);  
  client.set(key, JSON.stringify(result));
  return result;
  
}