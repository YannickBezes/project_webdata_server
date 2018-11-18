import auth from './middlewares/auth'
import members from './members'
import properties from './properties';
import services from './services';

export default (app) => {
    // MEMBERS
    // Get list of members, we need to be AUTHENTIFIED
    app.get('/members', auth, (req, res) => members.get(req, res))

    // Add a member need to be AUTHENTIFIED
    app.post('/member', auth, (req, res) => members.add(req, res))

    // Update a member need to be AUTHENTIFIED
    app.patch('/member', auth, (req, res) => members.update(req, res))

    // Delete a member need to be AUTHENTIFIED
    app.delete('/member', auth, (req, res) => members.delete(req, res))



    // PROPERTIES
    // Get all properties
    app.get('/properties', (req, res) => properties.get(req, res))

    // Get properties by keywords
    app.get('/properties/keywords/:keywords', (req, res) => properties.get_by_keywords(req, res))

    // Get properties by owner email need to be AUTHENTIFIED
    app.get('/properties/owner/:email', auth, (req, res) => properties.get_by_owner_email(req, res))

    // Get properties by date
    app.get('/properties/date/:date', (req, res) => properties.get_by_date(req, res))

    // Add a property need to be AUTHENTIFIED
    app.post('/property', auth, (req, res) => properties.add(req, res))

    // Delete a property
    app.delete('/property', auth, (req, res) => properties.delete(req, res))

    // Update the field 'uses' of a property need to be AUTHENTIFIED
    app.patch('/property/uses/:_id', auth, (req, res) => properties.update_uses(req, res))



    // SERVICES
    // Get all services
    app.get('/services', (req, res) => services.get(req, res))

    // Get services by keywords
    app.get('/services/keywords/:keywords', (req, res) => services.get_by_keywords(req, res))

    // Get services by date
    app.get('/services/date/:date', (req, res) => services.get_by_date(req, res))

    // Get services by owner email
    app.get('/services/owner/:email', auth, (req, res) => services.get_by_owner_email(req, res))

    // Add a service need to be AUTHENTIFIED
    app.post('/service', auth, (req, res) => services.add(req, res))

    // Delete a service need to be AUTHENTIFIED
    app.delete('/service', auth, (req, res) => services.delete(req, res))

    // Update the field 'uses' of a service need to be AUTHENTIFIED
    app.patch('/service/uses/:_id', auth, (req, res) => services.update_uses(req, res))

    // TODO: add an endpoint to update the service and property
    // TODO: add an endpoint to update the disponibilities of the service and property

    // DEFAULT request
    app.use((req, res) => {
        res.json({"status": "failed", "data": null, "message": 'Error can\'t find a endpoint for '+ req.method  + ' ' + req.url})
    })
    // OR
    // app.all('*', (req, res) => {
    //     res.json({"status": "failed", "data": null, "message": 'Error can\'t find a endpoint for '+ req.method  + ' ' + req.url})
    // })
}