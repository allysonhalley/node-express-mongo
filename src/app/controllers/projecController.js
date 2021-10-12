const express = require('express');
const authMiddleware = require('../middlewares/auth');

const Project = require('../models/Project');
const Task = require('../models/Task');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async ( req, res ) => {
  try {
    const projects = await Project.find().populate(['user', 'tasks']);
    return res.send({ projects });      
  } catch (err) {
    return res.status(400).send({ error: 'Ops! '+err});
  }  
});

router.get('/:projectId', async (req, res) => {  
  try {
    const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);
    if (!project ) {
      return res.status(400).send({ error: 'Project not found!' });
    }
    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: 'Ops! '+err });
  }  
});

router.post('/', async (req, res) => {    
  try {    
    const  { title, description, tasks } = req.body;
    const project = await Project.create({ title, description, user: req.userId });

    await Promise.all(tasks.map( async task => {
      const projectTask = new Task({ ...task, project: project._id, assignedTo: req.userId });             
      await projectTask.save();
      project.tasks.push(projectTask);
    }));

    await project.save();

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: 'Failed to create! '+err });
  }  
});

router.put('/:projectId', async (req, res) => {
    try {    
    const  { title, description, tasks } = req.body;
    const project = await Project.findByIdAndUpdate( req.params.projectId, {
      title,
      description
    }, { new: true });
    
    project.tasks = [];
    await Task.remove({ project: project._id });

    console.log(tasks);
    await Promise.all(tasks.map( async task => {
      const projectTask = new Task({ ...task, project: project._id, assignedTo: req.userId });             
      await projectTask.save();
      project.tasks.push(projectTask);
    }));

    await project.save();
    return res.send({ project });

  } catch (err) {
    return res.status(400).send({ error: 'Failed to update! '+err });
  }  
});

router.delete('/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    if(! await Project.findOne({ projectId }) ){
      return res.status(400).send({ error: 'Project not found!'});
    }
    await Project.findByIdAndRemove(projectId);
    return res.send({ ok: 'Delete success!'});
  } catch (err) {
    return res.status(400).send({ error: 'Failed to delete! '+err})
  }
});
module.exports = app => app.use('/projects', router);