// ProjectContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const ProjectContext = createContext()

export const ProjectProvider = ({ children }) => {
    const [activeProject, setActiveProject] = useState(() => localStorage.getItem("activeProjet"))

    const updateProject = (newProject) => {
        localStorage.setItem("activeProjet", newProject)
        setActiveProject(newProject)
    }

    return (
        <ProjectContext.Provider value={{ activeProject, updateProject }}>
            {children}
        </ProjectContext.Provider>
    )
}

export const useProject = () => useContext(ProjectContext)
