import { db } from '../db'
import { ObjectId } from 'mongodb'
import Properties from './properties'

export default class {
    static get collection() { return db.collection('members') }

    /**
     * Get all members
     *
     * @param {*} req
     * @param {*} res
     */
    static get(req, res) {
        this.collection.find().map(doc => {
            // Delete password and role property to each document
            delete doc.password
            delete doc.role
            return doc
        }).toArray((err, docs) => {
            if (err)
                res.json({ "status": "failed", "data": null, "message": "Can't get members, err : " + err })
            else
                res.json({"status": "success", "data": docs })
        })
    }

    /**
     * Add a member
     *
     * @param {*} req
     * @param {*} res
     */
    static add(req, res) {
        // Check if the email does not exist
        this.collection.find({ email: req.body.email }).toArray((err, docs) => {
            if (err)
                res.json({ "status": "failed", "data": null, "message": "Can't check if the email already exist" })
            else {
                if (docs.length > 0) 
                    res.json({ "status": "failed", "data": null, "message": "Email already exist" })
                else {
                    try {
                        // Insert the member and get it after
                        // sort({_id: -1}) to sort from newest to oldest
                        // limt(1) to limit the number to one
                        this.collection.insertOne(req.body).then(() => {
                            this.collection.find().sort({ _id: -1 }).limit(1).toArray((err, docs) => {
                                if (err)
                                    res.json({ "status": "failed", "data": null, "message": "Can't insert the member, err : " + err })
                                else
                                    res.json({ "status": "success", "data": docs.pop() })
                            })
                        })
                    } catch (error) {
                        res.json({ "status": "failed", "data": null, "message": "Can't insert the member, err : " + error.toString() })
                    }
                }
            }
        })            
    }

    /**
     * Update a member
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static update(req, res) {
        try {
            this.collection.find({ _id: ObjectId(req.body._id) }).toArray((err, docs) => {
                if (err)
                        res.json({ "status": "failed", "data": null, "message": "Can't insert the member, err : " + err })
                else {
                    // Take old fields of the member
                    let old_member = docs.pop()

                    let new_member = {};
                    Object.assign(new_member, req.body)
                    delete new_member.password
                    delete new_member.role
                    delete new_member._id

                    // Create the set to update the member we just remove the _id
                    let set = {};
                    Object.assign(set, req.body)
                    delete set._id
                    // update with the new fields
                    this.collection.updateOne({ _id: ObjectId(req.body._id) }, { $set: set }).then(result => {
                        if (result.modifiedCount == 0)
                            res.json({ "status": "failed", "data": null, "message": "Member not update" })
                        else {
                            this.collection.find({ _id: ObjectId(req.body._id) }).toArray((err, docs) => {
                                if (err)
                                    res.json({ "status": "failed", "data": null, "message": "Can't get member, err : " + err })
                                else
                                    res.json({ "status": "success", "data": docs.pop()})
                            })
                            // Update properties and services where the owner is the member updated
                            db.collection('properties').updateMany({ "owner.email": old_member.email }, { $set: { owner: new_member } })
                            db.collection('services').updateMany({ "owner.email": old_member.email }, { $set: { owner: new_member } })

                            // Update properties and services where the user is the member updated
                            db.collection('properties').updateMany({ "uses.user.email": old_member.email }, { $set: { "uses.$.user": new_member } })
                            db.collection('services').updateMany({ "uses.user.email": old_member.email}, { $set: { "uses.$.user": new_member } })
                        }
                    })
                }
            })
            
        } catch (error) {
            res.json({ "status": "failed", "data": null, "message": "Can't update the member, err : " + error.toString() })
        }
    }

    /**
     * Delete a member which the _id given in the request
     *
     * @param {*} req
     * @param {*} res
     */
    static delete(req, res) {
        try {
            this.collection.deleteOne({ _id: ObjectId(req.body._id) }).then(result => {
                // Check if a member as been deleted
                if(result.deletedCount == 0)
                    res.json({"status": "failed", "data": null, "message": "No member deleted"})
                else
                    res.json({"status": "success", "data": req.body})
            })    
        } catch (error) {
            res.json({"status": "failed", "data": null, "message": "Can't delete the member, err : " + error.toString() })
        }
    }
}