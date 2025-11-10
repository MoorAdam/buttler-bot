import { useState, useEffect } from 'react';
import Head from "next/head";
import styles from "@/styles/Home.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Parameter {
  id: number;
  name: string;
  type: string;
  value: string;
  created_at: string;
  updated_at: string;
}

interface EditingRow {
  id: number | null;
  name: string;
  type: string;
  value: string;
}

export default function Home() {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  // Fetch parameters from API
  const fetchParameters = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/parameters`);
      const data = await response.json();
      
      if (data.success) {
        setParameters(data.data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch parameters');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  // Handle add new row
  const handleAddNew = () => {
    setEditingRow({
      id: null,
      name: '',
      type: 'text',
      value: ''
    });
  };

  // Handle save (create or update)
  const handleSave = async () => {
    if (!editingRow) return;

    // Validation
    if (!editingRow.name.trim() || !editingRow.value.trim()) {
      alert('Name and value are required');
      return;
    }

    try {
      const isUpdate = editingRow.id !== null;
      const url = isUpdate 
        ? `${API_URL}/api/parameters/${editingRow.id}`
        : `${API_URL}/api/parameters`;
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingRow.name,
          type: editingRow.type,
          value: editingRow.value
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchParameters();
        setEditingRow(null);
        setError('');
      } else {
        setError(data.error || 'Failed to save parameter');
      }
    } catch (err) {
      setError('Failed to save parameter');
      console.error('Save error:', err);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingRow(null);
  };

  // Handle edit
  const handleEdit = (param: Parameter) => {
    setEditingRow({
      id: param.id,
      name: param.name,
      type: param.type,
      value: param.value
    });
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/parameters/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await fetchParameters();
        setShowDeleteModal(null);
        setError('');
      } else {
        setError(data.error || 'Failed to delete parameter');
      }
    } catch (err) {
      setError('Failed to delete parameter');
      console.error('Delete error:', err);
    }
  };

  return (
    <>
      <Head>
        <title>Bot Configuration</title>
        <meta name="description" content="Manage bot parameters" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Bot Configuration</h1>
          <p className={styles.description}>Manage your bot parameters</p>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.controls}>
            <button 
              onClick={handleAddNew} 
              className={styles.addButton}
              disabled={editingRow !== null}
            >
              + Add New Parameter
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* New row for adding */}
                  {editingRow && editingRow.id === null && (
                    <tr className={styles.editingRow}>
                      <td>
                        <input
                          type="text"
                          value={editingRow.name}
                          onChange={(e) => setEditingRow({...editingRow, name: e.target.value})}
                          placeholder="Parameter name"
                          className={styles.input}
                        />
                      </td>
                      <td>
                        <select
                          value={editingRow.type}
                          onChange={(e) => setEditingRow({...editingRow, type: e.target.value})}
                          className={styles.select}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="url">URL</option>
                          <option value="key">Key</option>
                          <option value="boolean">Boolean</option>
                          <option value="email">Email</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editingRow.value}
                          onChange={(e) => setEditingRow({...editingRow, value: e.target.value})}
                          placeholder="Parameter value"
                          className={styles.input}
                        />
                      </td>
                      <td>
                        <button onClick={handleSave} className={styles.saveButton}>Save</button>
                        <button onClick={handleCancel} className={styles.cancelButton}>Cancel</button>
                      </td>
                    </tr>
                  )}

                  {/* Existing parameters */}
                  {parameters.length === 0 && !editingRow ? (
                    <tr>
                      <td colSpan={4} className={styles.empty}>
                        No parameters yet. Click "Add New Parameter" to create one.
                      </td>
                    </tr>
                  ) : (
                    parameters.map((param) => (
                      editingRow && editingRow.id === param.id ? (
                        // Editing mode
                        <tr key={param.id} className={styles.editingRow}>
                          <td>
                            <input
                              type="text"
                              value={editingRow.name}
                              onChange={(e) => setEditingRow({...editingRow, name: e.target.value})}
                              className={styles.input}
                            />
                          </td>
                          <td>
                            <select
                              value={editingRow.type}
                              onChange={(e) => setEditingRow({...editingRow, type: e.target.value})}
                              className={styles.select}
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="url">URL</option>
                              <option value="key">Key</option>
                              <option value="boolean">Boolean</option>
                              <option value="email">Email</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editingRow.value}
                              onChange={(e) => setEditingRow({...editingRow, value: e.target.value})}
                              className={styles.input}
                            />
                          </td>
                          <td>
                            <button onClick={handleSave} className={styles.saveButton}>Save</button>
                            <button onClick={handleCancel} className={styles.cancelButton}>Cancel</button>
                          </td>
                        </tr>
                      ) : (
                        // View mode
                        <tr key={param.id}>
                          <td>{param.name}</td>
                          <td>
                            <span className={styles.typeBadge}>
                              {param.type}
                            </span>
                          </td>
                          <td className={styles.valueCell} title={param.type === 'key' ? 'Hidden for security' : param.value}>
                            {param.type === 'key' 
                              ? '••••••••' 
                              : param.value.length > 50 
                                ? param.value.substring(0, 50) + '...'
                                : param.value
                            }
                          </td>
                          <td>
                            <button 
                              onClick={() => handleEdit(param)} 
                              className={styles.editButton}
                              disabled={editingRow !== null}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => setShowDeleteModal(param.id)} 
                              className={styles.deleteButton}
                              disabled={editingRow !== null}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Delete confirmation modal */}
        {showDeleteModal !== null && (
          <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete this parameter?</p>
              <p className={styles.modalWarning}>This action cannot be undone.</p>
              <div className={styles.modalActions}>
                <button 
                  onClick={() => handleDelete(showDeleteModal)} 
                  className={styles.confirmDeleteButton}
                >
                  Delete
                </button>
                <button 
                  onClick={() => setShowDeleteModal(null)} 
                  className={styles.modalCancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
