import {DAO} from "./DAO"
import mongoose from "mongoose";
import {productSchema} from "./schemas/Schemas"
import {SingletonMongo} from "../Singleton/SingletonMongo";
import {DATABASE_NAME, PRODUCT_COLLECTION} from "../config";
//import { Product } from "../../Model/Product";


/*-----------------------------------------------------------------------
 DAO PRODUCT
 Class for managing the connection to the database and the queries related
 to the Product
 METHODS:
    - getAll()
    - getObject(code_: unknown)
    - create(object: any)
    - update(object: any)
    - delete(object: unknown)
-----------------------------------------------------------------------*/
export class DAOProduct implements DAO{

    constructor(){};

    getAll(){

    };

    /*
    -----------------------------------------------------------------------
    GET OBJECT METHOD
    Gets a product in the database
    PARAMS:
        - code: String | Undefined
    RETURNS:
        - Product if the product was found
        - false if the product was not found
    */
    async getObject(code_: unknown){
        try{
            //Get the database instance from the singleton and connect to it
            SingletonMongo.getInstance().connect();
            const db = SingletonMongo.getInstance().getDatabase(DATABASE_NAME);
            const collection = db.collection(PRODUCT_COLLECTION);

            //Get the product from the database, using the code
            const product = await collection.findOne({ code: code_ });
            SingletonMongo.getInstance().disconnect_();    //Disconnect from the database
            // If the product was found, return it, else return false
            if (product) {
                console.log("Se encontro: " + JSON.stringify(product, null, 2));
                return product;
            } else {
                console.log("No se encontró el producto con el código: " + code_);
                return false; 
            }

        } catch(err){
            console.log(err);
            return false;
        }
    };

    /*
    -----------------------------------------------------------------------
    CREATE METHOD
    Create a product in the database
    PARAMS:
        - object: Product
    RETURNS:
        - true if the product was created
        - false if the product was not created
    */
    async create(object: any){
        try{
            //Get the database instance from the singleton and connect to it
            SingletonMongo.getInstance().connect();
            const db = SingletonMongo.getInstance().getDatabase(DATABASE_NAME);
            const collection = db.collection(PRODUCT_COLLECTION);
            const Product = mongoose.model('Product', productSchema);

            //Create a new product with the object received
            let newProduct = new Product({
                code: object.code,
                description: object.description,
                cuantityAvailable: object.cuantityAvailable,
                image: object.image,
                price: object.price
            });
            //Check if the product already exists
            const product = await collection.findOne({ code: object.code });
            if (product){
                console.log("El producto " +  object.code + " ya existe");
                return false;
            }
            //Insert the product in the database, convert it to JSON and parse it
            const newProductJson = JSON.stringify(newProduct);
            const newProductparsed = JSON.parse(newProductJson);
            await collection.insertOne(newProductparsed);
            console.log("Se inserto: " + newProductJson);
            SingletonMongo.getInstance().disconnect_();    //Disconnect from the database
            return true;
        } catch(err){
            console.log(err);
        }
        return false;
    };

    /*
    -----------------------------------------------------------------------
    UPDATE METHOD
    Update a product in the database
    PARAMS:
        - object: Product
    RETURNS:
        - true if the product was updated
        - false if the product was not updated
    */
    async update(object: any){
        try{
            //Mongo connection with singleton
            SingletonMongo.getInstance().connect();
            const db = SingletonMongo.getInstance().getDatabase(DATABASE_NAME);  
            const collection = db.collection(PRODUCT_COLLECTION);
            //Get the model from the database with the schema
            const Product = mongoose.model('Product', productSchema);
            //Create a new product with the object received
            let updatedProduct = new Product({
                code: object.code,
                description: object.description,
                cuantityAvailable: object.cuantityAvailable,
                image: object.image,
                price: object.price
            });
            //Create the update object for updating the product
            const InfoToUpdate = {
                $set: {
                    description: updatedProduct.description,
                    cuantityAvailable: updatedProduct.cuantityAvailable,
                    image: updatedProduct.image,
                    price: updatedProduct.price
                    }
            };
            const result = await collection.updateOne({ code: updatedProduct.code }, InfoToUpdate); //Update the product in the database
            SingletonMongo.getInstance().disconnect_();    //Disconnect from the database
            //Check if the product was updated  
            if (result.modifiedCount > 0) {
                console.log("Producto actualizado con éxito " + JSON.stringify(updatedProduct, null, 2));
                return true;
            } else {
                console.log("No se encontró el producto para actualizar o no se actualizó ningun campo");
                return false;
            }
        } catch(err){
            console.log(err);
        } //end try-catch
        return true;
    };

    /*
    -----------------------------------------------------------------------
    UPDATE METHOD
    Update a product in the database
    PARAMS:
        - object: Product
    RETURNS:
        - true if the product was updated
        - false if the product was not updated
    */
    delete(object: unknown){
        return true;
    };
}
