import {DAO} from "./DAO"
import {PurchaseSchema} from "./schemas/Schemas"
import mongoose from "mongoose";
import {SingletonMongo} from "../Singleton/SingletonMongo";
import {DATABASE_NAME, PURCHASE_COLLECTION} from "../config";
import { User } from "../../Model/User";

/*-----------------------------------------------------------------------
DAO PURCHASE
 Class for managing the connection to the database and the queries related
 to the purchase

PURCHASE ATTRIBUTES::
    - purchaseId: number
    - purchaseDetails: string
    - products: array
    - voucherId: string   -> Image id of the voucher
    - aproxDeliveryDate: date
    - shippingAdress: string
    - shippingPrice: number
    - userId: number
    - state: string

 METHODS:
    - getAll()
    - getObject(code_: unknown)
    - create(object: any)
    - update(object: any)
    - delete(object: unknown)
-----------------------------------------------------------------------*/
export class DAOPurchase implements DAO{

    constructor(){};

    /*
    -----------------------------------------------------------------------
    GET ALL METHOD
    Gets all the purchasehistories in the database
    PARAMS:
        - none
    RETURNS:
        - purchasehistories: array of purchasehistories
        - error 
    */
        async getAll(){
            try {
                //Get the database instance from the singleton and connect to it
                SingletonMongo.getInstance().connect();
                const db = SingletonMongo.getInstance().getDatabase(DATABASE_NAME);
                const collection = db.collection(PURCHASE_COLLECTION);
            
                //Get the purchasehistories from the database, using the code
                let purchase = await collection.find({}).toArray();
                SingletonMongo.getInstance().disconnect_();    //Disconnect from the database
                if (purchase) {
                    //console.log("Se encontraron los carritos: " + JSON.stringify(purchasehistories, null, 2));
                    return purchase;
                }
                else{
                    return {"name": "No se encontraron compras"};
                }
            } catch (error) {
                //console.log(error);
                return {"name": "No se encontraron compras"};
            }
        };

    /*
    -----------------------------------------------------------------------
    GET OBJECT METHOD
    Gets a purchase  in the database
    PARAMS:
        - code: unknown
    RETURNS:
        - purchase  if the purchase  was found
        - error message if the purchase was not found
    */
    async getObject(purchaseId_: unknown){
        try{
            //Get the database instance from the singleton and connect to it
            SingletonMongo.getInstance().connect();
            const db = SingletonMongo.getInstance().getDatabase(DATABASE_NAME);
            const collection = db.collection(PURCHASE_COLLECTION);
            //Get the Purchase from the database, using the code
            const purchase = await collection.findOne({ purchaseId: purchaseId_ });
            SingletonMongo.getInstance().disconnect_();    //Disconnect from the database
            // If the product history was found, return it, else return error message
            if (purchase) {
                //console.log("Se encontró: " + JSON.stringify(purchase, null, 2));
                return purchase;
            } else {
                //console.log("No se encontró el historial con el código: " + purchaseId_);
                return {"name": "No se encontró la compra"}; 
            }
        } catch(err){
            //console.log(err);
            return {"name": "No se encontró la compra"};
        }
    };

     /*
    -----------------------------------------------------------------------
    CREATE METHOD
    Create a purchase in the database
    PARAMS:
        - object: Product History
    RETURNS:
        - ok message if the purchase was created
        - error message if the purchase was not created
    */
    async create(object: any) {
        try{
            //Get the database instance from the singleton and connect to it
            SingletonMongo.getInstance().connect();
            const db = SingletonMongo.getInstance().getDatabase(DATABASE_NAME);
            const collection = db.collection(PURCHASE_COLLECTION);
            const Purchase = mongoose.model('Purchase', PurchaseSchema);
            
            //Create a new purchase with the object received
            let newPurchase = new Purchase({
                purchaseDetails: object.purchaseDetails,
                products: object.products,
                voucherId : object.voucherId,   
                aproxDeliveryDate: object.aproxDeliveryDate,
                shippingAddress: object.shippingAddress,
                shippingPrice: object.shippingPrice,
                userId: object.userId,
                state: object.state
            });
            
            //Insert the purchase in the database, convert it to JSON and parse it
            const newPurchaseJson = JSON.stringify(newPurchase);
            const newPurchaseParsed = JSON.parse(newPurchaseJson);
            await collection.insertOne(newPurchaseParsed);

            //console.log("Se insertó: " + newPurchaseJson);
            SingletonMongo.getInstance().disconnect_();    //Disconnect from the database
            return {"name": "Se insertó la compra"};
            
        }catch(err){
            //console.log(err);
            return {"name": "No se insertó la compra"};
        }
    };

    /*
    -----------------------------------------------------------------------
    UPDATE METHOD
    Update a purchase in the database
    PARAMS:
        - object: unknown
    RETURNS:
        - ok message if the purchase was updated
        - error message if the purchase was not updated
    */
    async update(object: any){
        //Si voy a agregar algo al purchase, me pego a mongo y lo agrego
        //no lo agrege porque creo que se plantea diferente al resto
        try{
            const purchase = mongoose.model('Purchase', PurchaseSchema);
            const result = await purchase.updateOne(object);
        }catch(err){
            console.log(err);
        }
        return {"name": "No se actualizó la compra"};
    };

    /*
    -----------------------------------------------------------------------
    UPDATE STATE METHOD
    Update a purchase  in the database
    PARAMS:
        - object: unknown
    RETURNS:
        - ok message if the purchase was updated
        - error message if the purchase was not updated
    */
    async updatePurchaseState(userId_: number, purchaseId_: number, state_: string){
        try{
            SingletonMongo.getInstance().connect();
            const db = SingletonMongo.getInstance().getDatabase(DATABASE_NAME);
            const collection = db.collection(PURCHASE_COLLECTION);

            //Verify existence of the product history
            const purchase = await collection.findOne({ purchaseId: purchaseId_, userId: userId_ });
            if (!purchase){
                return {"name": "La compra no existe"};
            }
            //Update the product in the database
            const result = await collection.updateOne({ purchaseId: purchaseId_ }, { $set: { state: state_ } });
            
            SingletonMongo.getInstance().disconnect_();    //Disconnect from the database
            //Check if the product was updated
            if (result.modifiedCount > 0) {
                //console.log("La compra se actualizó con éxito");
                return {"name": "La compra se actualizó con éxito"};
            } else {
                return {"name": "No se encontró la compra a actualizar"};
            }
        } catch(err){
            return {"name": "No se actualizó la compra"};
        }
    };

    /*
    -----------------------------------------------------------------------
    DELETE METHOD
    Delete a purchase in the database
    PARAMS:
        - object: unknown
    RETURNS:
        - ok message if the purchase  was deleted
        - error message if the purchase  was not deleted
    */
    async delete(purchaseId_: unknown){
        try{
            console.log("code: " + purchaseId_);
            SingletonMongo.getInstance().connect();
            const db = SingletonMongo.getInstance().getDatabase(DATABASE_NAME);
            const collection = db.collection(PURCHASE_COLLECTION);

            //Verify existence of the product history
            const product = await collection.findOne({ purchaseId: purchaseId_ });
            if (!product){
                //console.log("El producto " +  purchaseId_ + " no existe");
                return {"name": "El producto no existe"};
            }
            //Delete the product in the database
            const result = await collection.deleteOne({ purchaseId: purchaseId_ });
            
            SingletonMongo.getInstance().disconnect_();    //Disconnect from the database
            //Check if the product was deleted
            if (result.deletedCount > 0) {
                return {"name": "La compra se eliminó con éxito"};
            } else {
                return {"name": "No se encontró la compra a eliminar"};
            }

        } catch(err){
            return {"name": "No se eliminó la compra"};
        }
    };
}
