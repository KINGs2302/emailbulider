import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import axios from 'axios';
import "./App.css";

const Canvas = () => {
  const [editor, setEditor] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    const editorInstance = grapesjs.init({
      container: '#gjs',
      height: '600px',
      width: '80vw',
      storageManager: false,
      blockManager: {
        appendTo: '#gjs',
        blocks: [
          {
            id: 'section',
            label: '<b>Section</b>',
            attributes: { class: 'gjs-block-section' },
            content: `<section>
              <h1>This is a simple title</h1>
              <div>This is just a Lorem text: Lorem ipsum dolor sit amet</div>
            </section>`,
          },
          {
            id: 'text',
            label: 'Text',
            content: '<div data-gjs-type="text">Insert your text here</div>',
          },
          {
            id: 'image',
            label: 'Image',
            select: true,
            content: { type: 'image' },
            activate: true,
          },
        ],
      },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Mobile', width: '320px', widthMedia: '480px' },
        ],
      },
      canvas: {
        styles: ['./App.css'],
      },
    });
    setEditor(editorInstance);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/canvas');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const createNewProject = async () => {
    try {
      const projectName = prompt('Enter project name:');
      if (!projectName) return;

      const newProject = {
        name: projectName,
        elements: [],
      };

      const response = await axios.post('http://localhost:5000/api/canvas', newProject);
      setCurrentProject(response.data);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const saveProject = async () => {
    if (!currentProject || !editor) return;
  
    try {
      // Save both components and styles
      const elements = JSON.stringify(editor.getComponents());
      const styles = editor.getCss();
  
      await axios.put(`http://localhost:5000/api/canvas/${currentProject._id}`, {
        elements,
        styles,
      });
  
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };
  
  const loadProject = async (project) => {
    if (!editor) return;
  
    try {
      const response = await axios.get(`http://localhost:5000/api/canvas/${project._id}`);
      const loadedProject = response.data;
  
      // Set both components and styles
      editor.setComponents(JSON.parse(loadedProject.elements));
      editor.setStyle(loadedProject.styles || '');
      setCurrentProject(loadedProject);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };
  

  const downloadHTML = () => {
    if (!editor) return;

    const html = editor.getHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentProject?.name || 'project'}.html`;
    link.click();
  };

  const downloadJSON = () => {
    if (!editor) return;

    const json = JSON.stringify(editor.getComponents(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentProject?.name || 'project'}.json`;
    link.click();
  };

  return (
    <div className="canvas-container">
      <div className="project-controls">
        <button onClick={createNewProject}>New Project</button>
        <button onClick={saveProject} disabled={!currentProject}>
          Save Project
        </button>
        <button onClick={downloadHTML} disabled={!editor}>
          Download HTML
        </button>
        <button onClick={downloadJSON} disabled={!editor}>
          Download JSON
        </button>
        <select
          onChange={(e) => {
            const project = projects.find((p) => p._id === e.target.value);
            if (project) loadProject(project);
          }}
          value={currentProject?._id || ''}
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div id="gjs" className="gjs"></div>
    </div>
  );
};

export default Canvas;

