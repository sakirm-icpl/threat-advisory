import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function EditDetectionMethod() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    name: "",
    protocol: "",
    code_snippets: [{ code_language: "", code_content: "" }],
    expected_response: "",
    requires_auth: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchMethod();
    // eslint-disable-next-line
  }, [id]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (e) {
      setError("Failed to load products");
    }
  };

  const fetchMethod = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/methods/${id}`);
      
      // Handle code snippets or legacy fields
      let code_snippets = [];
      if (res.data.code_snippets && res.data.code_snippets.length > 0) {
        code_snippets = res.data.code_snippets;
      } else if (res.data.code_language || res.data.code_content) {
        // Convert legacy fields to snippet format
        code_snippets = [{
          code_language: res.data.code_language || "",
          code_content: res.data.code_content || ""
        }];
      } else {
        code_snippets = [{ code_language: "", code_content: "" }];
      }
      
      setForm({
        product_id: res.data.product_id || "",
        name: res.data.name || "",
        protocol: res.data.protocol || "",
        code_snippets: code_snippets,
        expected_response: res.data.expected_response || "",
        requires_auth: !!res.data.requires_auth,
      });
    } catch (e) {
      setError("Failed to load detection method");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  
  const handleCodeSnippetChange = (index, field, value) => {
    const updatedSnippets = [...form.code_snippets];
    updatedSnippets[index] = { ...updatedSnippets[index], [field]: value };
    setForm({
      ...form,
      code_snippets: updatedSnippets
    });
  };
  
  const addCodeSnippet = () => {
    setForm({
      ...form,
      code_snippets: [...form.code_snippets, { code_language: "", code_content: "" }]
    });
  };
  
  const removeCodeSnippet = (index) => {
    if (form.code_snippets.length > 1) {
      const updatedSnippets = form.code_snippets.filter((_, i) => i !== index);
      setForm({
        ...form,
        code_snippets: updatedSnippets
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.name || !form.protocol) return;
    try {
      await api.put(`/methods/${id}`, form);
      navigate("/methods");
    } catch (e) {
      setError("Failed to update detection method");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Detection Method</h1>
          <p className="text-gray-600">Update your detection method configuration</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl mb-8 w-full flex flex-col gap-6 shadow-xl border border-blue-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product *</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
              required
            >
              <option value="">Select product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Method Name *</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., HTTP Header Detection"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Protocol *</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2"
              name="protocol"
              value={form.protocol}
              onChange={handleChange}
              placeholder="e.g., HTTP, SSH, SNMP"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Code Snippets</label>
            <button 
              type="button" 
              onClick={addCodeSnippet}
              className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
            >
              + Add Another Snippet
            </button>
          </div>
          
          {form.code_snippets.map((snippet, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Snippet #{index + 1}</h4>
                {form.code_snippets.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeCodeSnippet(index)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium mb-1">Programming Language</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    value={snippet.code_language}
                    onChange={(e) => handleCodeSnippetChange(index, 'code_language', e.target.value)}
                  >
                    <option value="">Select language</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="swift">Swift</option>
                    <option value="kotlin">Kotlin</option>
                    <option value="scala">Scala</option>
                    <option value="r">R</option>
                    <option value="matlab">MATLAB</option>
                    <option value="sql">SQL</option>
                    <option value="bash">Bash</option>
                    <option value="powershell">PowerShell</option>
                    <option value="shell">Shell</option>
                    <option value="yaml">YAML</option>
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="scss">SCSS</option>
                    <option value="less">LESS</option>
                    <option value="markdown">Markdown</option>
                    <option value="dockerfile">Dockerfile</option>
                    <option value="makefile">Makefile</option>
                    <option value="ini">INI</option>
                    <option value="toml">TOML</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium mb-1">Code Content</label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-3 py-2 h-32 font-mono text-sm"
                    value={snippet.code_content}
                    onChange={(e) => handleCodeSnippetChange(index, 'code_content', e.target.value)}
                    placeholder="Enter your code here..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expected Response/Output</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 h-20 font-mono text-sm"
            name="expected_response"
            value={form.expected_response}
            onChange={handleChange}
            placeholder="Enter expected output or response format..."
          />
        </div>
        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded border">{error}</div>}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Requires Authentication:</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="requires_auth"
                  value="true"
                  checked={form.requires_auth === true}
                  onChange={(e) => setForm({...form, requires_auth: e.target.value === "true"})}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="requires_auth"
                  value="false"
                  checked={form.requires_auth === false}
                  onChange={(e) => setForm({...form, requires_auth: e.target.value === "true"})}
                  className="mr-1"
                />
                No
              </label>
            </div>
          </div>
          <div className="flex gap-2 md:ml-auto">
            <button 
              type="submit" 
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
            <button 
              type="button" 
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              onClick={() => navigate("/methods")}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 