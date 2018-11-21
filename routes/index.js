import auth from './middlewares/auth'
import members from './members'
import properties from './properties';
import services from './services';

export default (app) => {
    // ------------ MEMBERS ------------
    // Get list of members, we need to be AUTHENTIFIED
    app.get('/api/members', auth, (req, res) => members.get_all(req, res))

    // Get a member
    app.get('/api/member/:_id', auth, (req, res) => members.get(req, res))

    // Login the member
    app.post('/api/login', (req, res) => members.login(req, res))

    // Add a member need to be AUTHENTIFIED
    app.post('/api/member', auth, (req, res) => members.add(req, res))

    // Update a member need to be AUTHENTIFIED
    app.patch('/api/member/:_id', auth, (req, res) => members.update(req, res))

    // Delete a member need to be AUTHENTIFIED
    app.delete('/api/member', auth, (req, res) => members.delete(req, res))



    // ------------ PROPERTIES ------------
    // Get all properties
    app.get('/api/properties', (req, res) => properties.get_all(req, res))

    // Get a property
    app.get('/api/property/:_id', (req, res) => properties.get(req, res))

    // Get properties by keywords
    app.get('/api/properties/keywords/:keywords', (req, res) => properties.get_by_keywords(req, res))

    // Get properties by owner email need to be AUTHENTIFIED
    app.get('/api/properties/owner/:email', auth, (req, res) => properties.get_by_owner_email(req, res))

    // Get properties by date
    app.get('/api/properties/date/:date', (req, res) => properties.get_by_date(req, res))

    // Add a property need to be AUTHENTIFIED
    app.post('/api/property', auth, (req, res) => properties.add(req, res))

    // Delete a property
    app.delete('/api/property', auth, (req, res) => properties.delete(req, res))

    // Update a property
    app.patch('/api/property/:_id', auth, (req, res) => properties.update(req, res))

    // Update the field 'uses' of a property need to be AUTHENTIFIED
    app.patch('/api/property/uses/:_id', auth, (req, res) => properties.update_uses(req, res))

    // Update the field 'disponibilities of a service need to be AUTHENTIFIED
    app.patch('/api/property/disponibilities/:_id', auth, (req, res) => properties.update_disponibilities(req, res))



    // ------------ SERVICES ------------
    // Get all services
    app.get('/api/services', (req, res) => services.get_all(req, res))

    // Get a service
    app.get('/api/service/:_id', (req, res) => services.get(req, res))

    // Get services by keywords
    app.get('/api/services/keywords/:keywords', (req, res) => services.get_by_keywords(req, res))

    // Get services by date
    app.get('/api/services/date/:date', (req, res) => services.get_by_date(req, res))

    // Get services by owner email
    app.get('/api/services/owner/:email', auth, (req, res) => services.get_by_owner_email(req, res))

    // Add a service need to be AUTHENTIFIED
    app.post('/api/service', auth, (req, res) => services.add(req, res))

    // Delete a service need to be AUTHENTIFIED
    app.delete('/api/service', auth, (req, res) => services.delete(req, res))
    
    // Update a service
    app.patch('/api/service/:_id', auth, (req, res) => services.update(req, res))

    // Update the field 'uses' of a service need to be AUTHENTIFIED
    app.patch('/api/service/uses/:_id', auth, (req, res) => services.update_uses(req, res))

    // Update the field 'disponibilities of a service need to be AUTHENTIFIED
    app.patch('/api/service/disponibilities/:_id', auth, (req, res) => services.update_disponibilities(req, res))

    // DEFAULT request
    app.use((req, res) => {
        res.json({status: "failed", data: null, message: 'Error can\'t find a endpoint for '+ req.method  + ' ' + req.url})
    })
    // OR
    // app.all('*', (req, res) => {
    //     res.json({status: "failed", data: null, message: 'Error can\'t find a endpoint for '+ req.method  + ' ' + req.url})
    // })
}