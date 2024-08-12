import React, { useState, useCallback, useMemo } from 'react';
import html2canvas from 'html2canvas';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Parent', secondLabel: '', toggle: false, gender: 'M' }, style: { backgroundColor: '#fff' } },
  // { id: '2', position: { x: 0, y: 100 }, data: { label: 'Child 1', secondLabel: '', toggle: false, gender: 'F' }, style: { backgroundColor: '#fff' } },
];
// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
const initialEdges = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newLabel, setNewLabel] = useState('');
  const [additionalText, setAdditionalText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [gender, setGender] = useState('M');

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setNewLabel(node.data.label);
    setAdditionalText(node.data.secondLabel || '');
    setToggle(node.data.toggle || false);
    setGender(node.data.gender || 'M');
    setShowModal(true);
  };

  const handleLabelChange = (event) => {
    setNewLabel(event.target.value);
  };

  const handleAdditionalTextChange = (event) => {
    setAdditionalText(event.target.value);
  };

  const handleGenderChange = (value) => {
    setGender(value);
  };

  const handleLabelSubmit = (event) => {
    event.preventDefault();
    if (selectedNode) {
      const updatedNodes = nodes.map(node => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
              secondLabel: toggle ? additionalText : node.data.secondLabel,
              toggle: toggle,
              gender: gender,
            },
            style: { backgroundColor: toggle ? '#FF9999' : '#fff' },
          };
        }
        return node;
      });

      setNodes(updatedNodes);
      setShowModal(false);
    }
  };

  const handleAddNode = () => {
    if (selectedNode) {
      const newNodeId = String(nodes.length + 1);
      const newNode = {
        id: newNodeId,
        position: { x: Math.random() * 300, y: Math.random() * 300 },
        data: { label: `Child ${newNodeId}`, secondLabel: '', toggle: false, gender: 'M' },
        style: { backgroundColor: '#fff' },
      };

      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds, { id: `e${selectedNode.id}-${newNodeId}`, source: selectedNode.id, target: newNodeId }]);
      setSelectedNode(null);
      setShowModal(false);
    }
  };

  const handleToggle = () => {
    setToggle(!toggle);
  };

  const handleUpdateParentLabels = () => {
    if (selectedNode && additionalText) {
      const updatedNodes = nodes.map(node => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              secondLabel: additionalText,
              toggle: toggle,
              gender: gender,
            },
            style: { backgroundColor: toggle ? '#FF9999' : '#fff' },
          };
        }

        const isParent = edges.some(edge => edge.target === node.id && edge.source === selectedNode.id);
        if (isParent) {
          return {
            ...node,
            data: { ...node.data, secondLabel: additionalText },
            style: { backgroundColor: node.style?.backgroundColor || '#fff' },
          };
        }

        return node;
      });

      setNodes(updatedNodes);
    }
  };

  const { parentNodes, childNodes } = useMemo(() => {
    if (!selectedNode) return { parentNodes: [], childNodes: [] };

    const parents = [];
    const children = [];

    edges.forEach(edge => {
      if (edge.target === selectedNode.id) {
        const parentNode = nodes.find(node => node.id === edge.source);
        if (parentNode) {
          parents.push(parentNode);
        }
      } else if (edge.source === selectedNode.id) {
        const childNode = nodes.find(node => node.id === edge.target);
        if (childNode) children.push(childNode);
      }
    });

    return { parentNodes: parents, childNodes: children };
  }, [selectedNode, edges, nodes]);

  const handleExport = () => {
    html2canvas(document.querySelector('.react-flow')).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'diagram.png';
      link.click();
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        className="react-flow"
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      <button
        onClick={handleExport}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '10px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Export as Image
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '90%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: '0', marginRight: '10px' }}>Add  Profile</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ marginRight: '5px' }}>Gender:</label>
              <button
                type="button"
                onClick={() => handleGenderChange('M')}
                style={{
                  marginRight: '5px',
                  padding: '5px 10px',
                  backgroundColor: gender === 'M' ? '#007BFF' : '#ddd',
                  color: gender === 'M' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                M
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('F')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: gender === 'F' ? '#007BFF' : '#ddd',
                  color: gender === 'F' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                F
              </button>
            </div>
          </div>
          <form onSubmit={handleLabelSubmit}>
            <div style={{ marginBottom: '8px' }}>
              <label>
                Name:
                <input
                  type="text"
                  value={newLabel}
                  onChange={handleLabelChange}
                  style={{
                    marginBottom: '1px',
                    padding: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              </label>
            </div>

            {toggle && (
              <div style={{ marginBottom: '8px' }}>
                <h4 style={{ margin: '0 0 1px' }}>Married with</h4>
                <label>
                  Name:
                  <input
                    type="text"
                    value={additionalText}
                    onChange={handleAdditionalTextChange}
                    style={{
                      marginBottom: '1px',
                      padding: '5px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                </label>
              </div>
            )}
            <button
              type="submit"
              style={{
                marginRight: '4px',
                marginBottom: '5px',
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
              Update Name
            </button>
            <button
              type="button"
              onClick={handleToggle}
              style={{
                marginTop: '1px',
                marginBottom: '2px',
                padding: '8px 16px',
                backgroundColor: toggle ? '#FF9999' : '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = toggle ? '#FFCCCC' : '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = toggle ? '#FF9999' : '#007BFF'}
            >
              {toggle ? 'Married' : 'Not-Married'}
            </button>
            {toggle && (
              <button
                type="button"
                onClick={handleUpdateParentLabels}
                style={{
                  marginTop: '3px',
                  padding: '5px 10px',
                  backgroundColor: '#007BFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
              >
                Update Married with Name                      
              </button>
            )}
            {toggle && (
              <button
                type="button"
                onClick={handleAddNode}
                style={{
                  marginTop: '5px',
                  padding: '8px 16px',
                  backgroundColor: '#007BFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007BFF'}
              >
                Add Children
              </button>
            )}
          </form>
          <h4>Parent</h4>
          <ul>
            {parentNodes.map((node) => (
              <li key={node.id}>
                {node.data.label} {node.data.secondLabel && `and  ${node.data.secondLabel}`}
              </li>
            ))}
          </ul>
          <h4>Children</h4>
          <ul>
            {childNodes.map((node) => (
              <li key={node.id} onClick={(event) => handleNodeClick(event, node)}>
                {node.data.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -45%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}
      </style>
    </div>
  );
}
