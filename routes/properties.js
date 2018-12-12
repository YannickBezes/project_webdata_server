import { db } from '../db'
import { ObjectId } from 'mongodb'

export default class {
    static get collection() { return db.collection('properties') }
    
    /**
     * Get all properties
     * 
     * @param {*} req
     * @param {*} res
     */
    static get_all(req, res) {        
        this.collection.find().toArray((err, docs) => {
            if (err)
                res.json({ status: "failed", data: null, message: "Can't get properties, err : " + err })
            else
                res.json({ status: "success", data: docs, message: null })
        })
    }

    /**
     * Get a property
     * 
     * @param {*} req
     * @param {*} res
     */
    static get(req, res) {        
        this.collection.find({ _id: ObjectId(req.params._id) }).toArray((err, docs) => {
            if (err)
                res.json({ status: "failed", data: null, message: "Can't get property, err : " + err })
            else
                res.json({ status: "success", data: docs.pop(), message: null })
        })
    }

    /**
     * Get properties by keywords (example : `url/properties/keyword/maison`)
     *
     * @param {*} req
     * @param {*} res
     */
    static get_by_keyword(req, res) {
        this.collection.find({ $or: [{ keywords: { $elemMatch: { $eq: req.params.keyword.toLowerCase() } } }, { name: { $regex: req.params.keyword.toLowerCase(), $options: 'i' } } ] }).toArray((err, docs) => {
            if (err)
                res.json({ status: "failed", data: null, message: "Can't get properties, err : " + err })
            else
                res.json({ status: "success", data: docs, message: null })
        })
    }

    /**
     * Get properties by date
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static get_by_date(req, res) {
        this.collection.find().toArray((err, docs) => {
            if (err)
                res.json({ status: "failed", data: null, message: "Can't get properties, err : " + err })
            else
                var docs_valid = []
                docs.forEach(el => {
                    el['disponibilities'].forEach(date_string => {
                        if (new Date(date_string.split(" ")[0]).getTime() >= new Date(req.params.date).getTime())
                            docs_valid.push(el)
                    })
                })
                res.json({ status: "success", data: docs_valid, message: null })
        })
    }

    /**
     * Get properties by owner email
     *
     * @param {*} req
     * @param {*} res
     */
    static get_by_owner_email(req, res) {
        this.collection.find({ "owner.email": req.params.email }).toArray((err, docs) => {
            if (err) 
                res.json({ status: "failed", data: null, message: "Can't get properties, err : " + err })
            else {
                res.json({status: "success", data: docs, message: null })
            }
        })
    }

    /**
     * Add a property
     *
     * @param {*} req
     * @param {*} res
     */
    static add(req, res) {
        try {
            // Insert the member and get it after
            // sort({_id: -1}) to sort from newest to oldest
            // limt(1) to limit the number to one
            this.collection.insertOne(req.body).then(() => {
                this.collection.find().sort({ _id: -1 }).limit(1).toArray((err, docs) => {
                    if (err)
                        res.json({ status: "failed", data: null, message: "Can't insert the property, err : " + err })
                    else
                        res.json({ status: "success", data: docs.pop(), message: null })
                })
            })
        } catch (error) {
            res.json({ status: "failed", data: null, message: "Can't insert the property, err : " + error.toString() })
        }
    }

    /**
     * Delete a property which the _id given in the request
     *
     * @param {*} req
     * @param {*} res
     */
    static delete(req, res) {
        this.collection.deleteOne({_id: ObjectId(req.body._id)}).then(result => {
            if (result.deletedCount == 0)
                res.json({ status: "failed", data: null, message: "Can't delete the property" })
            else
                res.json({ status: "success", data: null, message: null })
        })
    }

        /**
     * Update a property
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static update(req, res) {
        try {
            // Remove the _id because the field can't be updated
            delete req.body._id
            // update with the new fields
            this.collection.updateOne({ _id: ObjectId(req.params._id) }, { $set: req.body }).then(result => {
                if (result.modifiedCount == 0)
                    res.json({ status: "failed", data: null, message: "Property not update" })
                else {
                    this.collection.find({ _id: ObjectId(req.params._id) }).toArray((err, docs) => {
                        if (err)
                            res.json({ status: "failed", data: null, message: "Can't get property, err : " + err })
                        else
                            res.json({ status: "success", data: docs.pop(), message: null })
                    })
                }
            })
        } catch (error) {
            res.json({ status: "failed", data: null, message: "Can't update the property, err : " + error.toString() })
        }
    }

    /**
     * Update the field 'uses' 
     *
     * @param {*} req
     * @param {*} res
     */
    static update_uses(req, res) {
        let modifier; // modifier for the update
        // We check if it's an array if it's an array so add each value
        if (Array.isArray(req.body.uses))
            modifier = { $each: req.body.uses }
        else
            modifier = req.body.uses
        try {
            this.collection.updateOne({ "_id": ObjectId(req.params._id) }, { $push: { "uses": modifier } }).then(result => {
                if (result.modifiedCount == 0)
                    res.json({ status: "failed", data: null, message: "No property update" })
                else {
                    this.collection.find({ "_id": ObjectId(req.params._id) }).toArray((err, docs) => {
                        if (err)
                            res.json({ status: "failed", data: null, message: "Can't get the property update, err : " + err })
                        else
                            res.json({ status: "success", data: docs.pop(), message: null })
                    })
                }
            })            
        } catch (error) {
            res.json({ status: "failed", data: null, message: "No property update, err : " + error.toString() })
        }
    }


    /**
     * Update the field 'disponibilities' 
     *
     * @param {*} req
     * @param {*} res
     */
    static update_disponibilities(req, res) {
        let modifier; // modifier for the update
        // We check if it's an array
        if (Array.isArray(req.body.disponibilities))
            modifier = { $each: req.body.disponibilities }
        else
            modifier = req.body.disponibilities
        try {
            this.collection.updateOne({ "_id": ObjectId(req.params._id) }, { $push: { "disponibilities": modifier } }).then(result => {
                if (result.modifiedCount == 0)
                    res.json({ status: "failed", data: null, message: "No property update" })
                else {
                    this.collection.find({ "_id": ObjectId(req.params._id) }).toArray((err, docs) => {
                        if (err)
                            res.json({ status: "failed", data: null, message: "Can't get the property update, err : " + err })
                        else
                            res.json({ status: "success", data: docs.pop(), message: null })
                    })
                }
            })
        } catch (error) {
            res.json({ status: "failed", data: null, message: "No property update, err : " + error.toString() })
        }
    }
}