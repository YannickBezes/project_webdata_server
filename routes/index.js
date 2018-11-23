import auth from './middlewares/auth'
import members from './members'
import properties from './properties';
import services from './services';
import swagger from 'swagger-ui-express'
import swagger_spec from '../swagger.json'

export default (app) => {
    // ------------ DOCUMENTATION ------------
    // Get docs for the API
    app.use('/docs', swagger.serve, swagger.setup(swagger_spec))



    // ------------ MEMBERS ------------
    // Get list of members, we need to be AUTHENTIFIED
    app.get('/members', auth, (req, res) => members.get_all(req, res))

    // Get a member
    app.get('/member/:_id', auth, (req, res) => members.get(req, res))

    // Get ratio of a member
    app.get('/member/ratio/:_id', auth, (req, res) => members.get_ratio(req, res))

    // Login the member
    app.post('/login', (req, res) => members.login(req, res))

    // Add a member need to be AUTHENTIFIED
    app.post('/member', auth, (req, res) => members.add(req, res))

    // Update a member need to be AUTHENTIFIED
    app.patch('/member/:_id', auth, (req, res) => members.update(req, res))

    // Delete a member need to be AUTHENTIFIED
    app.delete('/member/:_id', auth, (req, res) => members.delete(req, res))



    // ------------ PROPERTIES ------------
    // Get all properties
    app.get('/properties', (req, res) => properties.get_all(req, res))

    // Get a property
    app.get('/property/:_id', (req, res) => properties.get(req, res))

    // Get properties by keywords
    app.get('/properties/keywords/:keywords', (req, res) => properties.get_by_keywords(req, res))

    // Get properties by owner email need to be AUTHENTIFIED
    app.get('/properties/owner/:email', auth, (req, res) => properties.get_by_owner_email(req, res))

    // Get properties by date
    app.get('/properties/date/:date', (req, res) => properties.get_by_date(req, res))

    // Add a property need to be AUTHENTIFIED
    app.post('/property', auth, (req, res) => properties.add(req, res))

    // Delete a property
    app.delete('/property/:_id', auth, (req, res) => properties.delete(req, res))

    // Update a property
    app.patch('/property/:_id', auth, (req, res) => properties.update(req, res))

    // Update the field 'uses' of a property need to be AUTHENTIFIED
    app.patch('/property/uses/:_id', auth, (req, res) => properties.update_uses(req, res))

    // Update the field 'disponibilities of a service need to be AUTHENTIFIED
    app.patch('/property/disponibilities/:_id', auth, (req, res) => properties.update_disponibilities(req, res))



    // ------------ SERVICES ------------
    // Get all services
    app.get('/services', (req, res) => services.get_all(req, res))

    // Get a service
    app.get('/service/:_id', (req, res) => services.get(req, res))

    // Get services by keywords
    app.get('/services/keywords/:keywords', (req, res) => services.get_by_keywords(req, res))

    // Get services by date
    app.get('/services/date/:date', (req, res) => services.get_by_date(req, res))

    // Get services by owner email
    app.get('/services/owner/:email', auth, (req, res) => services.get_by_owner_email(req, res))

    // Add a service need to be AUTHENTIFIED
    app.post('/service', auth, (req, res) => services.add(req, res))

    // Delete a service need to be AUTHENTIFIED
    app.delete('/service/:_id', auth, (req, res) => services.delete(req, res))
    
    // Update a service
    app.patch('/service/:_id', auth, (req, res) => services.update(req, res))

    // Update the field 'uses' of a service need to be AUTHENTIFIED
    app.patch('/service/uses/:_id', auth, (req, res) => services.update_uses(req, res))

    // Update the field 'disponibilities of a service need to be AUTHENTIFIED
    app.patch('/service/disponibilities/:_id', auth, (req, res) => services.update_disponibilities(req, res))

    // DEFAULT request
    app.use((req, res) => {
        res.json({status: "failed", data: null, message: 'Error can\'t find a endpoint for '+ req.method  + ' ' + req.url})
    })
}