import { db } from '../db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import config from '../config'
import sha from 'jssha'

export default class {
    static get collection() { return db.collection('members') }

    /**
     * Login the user and return a token for this user
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static login(req, res) {
        req.body.password = encrypt_password(req.body.password)

        this.collection.find({ email: req.body.email }).toArray((err, docs) => {
            if (err)
                res.json({ status: "failed", data: null, message: err })
            else {
                if (docs.length == 0)
                    res.json({status: "failed", data: null, message: "User not found"})
                else {
                    let user = docs.pop()
                    if(user.password != req.body.password)
                        res.json({ status: "failed", data: null, message: "Wrong password" })
                    else {
                        let token = jwt.sign({ user: user.email, password: user.password }, config.SALT)
                        delete user['password']
                        delete user['role']
                        res.json({ status: "success", data: { token, user }, message: null })
                    }
                }
            }
        })
    }

    static is_admin(req, res) {
        this.collection.find({ _id: ObjectId(req.params._id) }).toArray((err, docs) => {
            if (err)
                res.json({ status: "failed", data: null, message: err })
            else {
                if (docs.length == 0)
                    res.json({status: "failed", data: null, message: "User not found"})
                else {
                    res.json({ status: "success", data: docs.pop()["role"] === "admin", message: null })
                }
            }
        })
    }
    /**
     * Get all members
     *
     * @param {*} req
     * @param {*} res
     */
    static get_all(req, res) {
        this.collection.find().map(doc => {
            // Delete password and role property to each document
            delete doc.password
            delete doc.role
            return doc
        }).toArray((err, docs) => {
            if (err)
                res.json({ status: "failed", data: null, message: "Can't get members, err : " + err })
            else {
                docs.forEach(user => {
                    delete user['password']
                    delete user['role']
                });
                res.json({ status: "success", data: docs, message: null })
            }
        })
    }

    /**
     * Get a member
     *
     * @param {*} req
     * @param {*} res
     */
    static get(req, res) {
        this.collection.find({ _id: ObjectId(req.params._id)}).map(doc => {
            // Delete password
            delete doc.password
            return doc
        }).toArray((err, docs) => {
            if (err)
                res.json({ status: "failed", data: null, message: "Can't get member, err : " + err })
            else {
                delete docs[0]['password']
                delete docs[0]['role']
                res.json({ status: "success", data: docs.pop(), message: null })
            }
        })
    }

    /**
     * Return the ration between rent and lend
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static async get_ratio(req, res) {
        // Get _id
        let result = await this.collection.find({ _id: ObjectId(req.params._id) }).toArray()
        let { email } = result.pop()
        // Get properties
        let properties = await db.collection('properties').find({ "owner.email": email }).toArray()
        // Get services
        let services = await db.collection('services').find({ "owner.email": email }).toArray()
        
        // Get uses for properties
        let uses_properties = await db.collection('properties').find({ "uses.user.email": email }).toArray()
        // Get uses for services
        let uses_services = await db.collection('services').find({ "uses.user.email": email }).toArray()

        // Calculate the ratio
        let ratio
        let total_uses = uses_properties.length + uses_services.length
        if (total_uses === 0)
            ratio = properties.length + services.length
        else
            ratio = (properties.length + services.length) / (uses_properties.length + uses_services.length)
        
        res.json({status: "success", data: { ratio }, message: null})
    }

    /**
     * Add a member
     *
     * @param {*} req
     * @param {*} res
     */
    static async register(req, res) {
        // Check if the email does not exist
        let exist = await this.email_exist(req.body.email)
        if (!exist) {
            try {
                // Insert the member and get it after
                // sort({_id: -1}) to sort from newest to oldest
                // limt(1) to limit the number to one
                req.body.password = encrypt_password(req.body.password)
                this.collection.insertOne(req.body).then(() => {
                    this.collection.find().sort({ _id: -1 }).limit(1).toArray((err, docs) => {
                        if (err)
                            res.json({ status: "failed", data: null, message: "Can't insert the member, err : " + err })
                        else
                            res.json({ status: "success", data: null, message: null })
                    })
                })
            } catch (error) {
                res.json({ status: "failed", data: null, message: "Can't insert the member, err : " + error.toString() })
            }
        } else {
            res.json({ status: "failed", data: null, message: "Email already exist" })
        }
    }

    /**
     * Update a member
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static async update(req, res) {
        // Check if the email does not exist
        let exist = await this.email_exist(req.body.email, req.params._id)
        if (!exist) {
            try {
                this.collection.find({ _id: ObjectId(req.params._id) }).toArray((err, docs) => {
                    if (err)
                            res.json({ status: "failed", data: null, message: "Can't insert the member, err : " + err })
                    else {
                        // Take old fields of the member
                        let old_member = docs.pop()
    
                        let new_member = {};
                        Object.assign(new_member, req.body)
                        delete new_member.password
                        delete new_member.role
                        delete new_member._id
    
                        // Remove the _id because the field can't be updated
                        delete req.body._id
                        // If there is the password encrypt it
                        if(req.body['password'])
                            req.body.password = encrypt_password(req.body.password)
                        // update with the new fields
                        this.collection.updateOne({ _id: ObjectId(req.params._id) }, { $set: { ...req.body } }).then(result => {
                            if (result.modifiedCount == 0)
                                res.json({ status: "failed", data: null, message: "Member not update" })
                            else {
                                this.collection.find({ _id: ObjectId(req.params._id) }).toArray((err, docs) => {
                                    if (err)
                                        res.json({ status: "failed", data: null, message: "Can't get member, err : " + err })
                                    else {
                                        let user = docs.pop()
                                        let token = jwt.sign({ user: user['email'], password: user['password'] }, config.SALT)
                                        delete user['password']
                                        delete user['role']
                                        res.json({ status: "success", data: { token, user }, message: null })

                                    }
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
                res.json({ status: "failed", data: null, message: "Can't update the member, err : " + error.toString() })
            }
        } else {
            res.json({ status: "failed", data: null, message: "Email already exist" })
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
            this.collection.deleteOne({ _id: ObjectId(req.params._id) }).then(result => {
                // Check if a member as been deleted
                if (result.deletedCount == 0)
                    res.json({ status: "failed", data: null, message: "No member deleted" })
                else
                    res.json({ status: "success", data: null, message: null })
            })    
        } catch (error) {
            res.json({status: "failed", data: null, message: "Can't delete the member, err : " + error.toString() })
        }
    }

    static email_exist(email, id = null) {
        return new Promise((resolve, reject) => {
            this.collection.find({ email }).toArray((err, docs) => {
                if (err)
                    req.json({ status: "failed", data: null, message: "Can't check if the email already exist, err : " + err })
                else {
                    if (docs.length != 0) {
                        if (id && docs.pop()._id == id)
                            resolve(false)
                        else
                            resolve(true)
                    }
                    resolve(true)
                }
            })
        })
    }
}

function encrypt_password(string) {
    const _sha = new sha('SHA-512', 'TEXT')
    _sha.update(string + config.SALT)
    return _sha.getHash('HEX')
}