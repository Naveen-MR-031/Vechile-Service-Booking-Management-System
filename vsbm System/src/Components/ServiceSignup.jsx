import React, { useState } from "react";
import styles from './ServiceSignup.module.css';
import {
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  Camera,
  Wrench,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios"; // ✅ ADD THIS
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS

const ServiceSignup = () => {
  const navigate = useNavigate(); // ✅ INITIALIZE HERE

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customServiceInput, setCustomServiceInput] = useState("");
  const [customServices, setCustomServices] = useState([]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    mapLink: "",
    address: "",
    phone: "",
    landline: "",
    services: {
      vehicleTypes: {
        car: false,
        bike: false,
        truck: false,
        bus: false,
        auto: false,
      },
      serviceTypes: {
        general: false,
        water: false,
        oil: false,
        tire: false,
        battery: false,
        detailing: false,
        engine: false,
        paint: false,
        ac: false,
        polishing: false,
        denting: false,
        towing: false,
      },
    },
    photos: [],
  });

  const serviceTypes = [
    { key: "general", label: "General Service" },
    { key: "water", label: "Water Service" },
    { key: "oil", label: "Oil Change" },
    { key: "tire", label: "Tire Service" },
    { key: "battery", label: "Battery Service" },
    { key: "detailing", label: "Detailing" },
    { key: "engine", label: "Engine Repair" },
    { key: "paint", label: "Paint Service" },
    { key: "ac", label: "AC Service" },
    { key: "polishing", label: "Polishing" },
    { key: "denting", label: "Denting" },
    { key: "towing", label: "Towing Service" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (section, type) => {
    setForm((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [section]: {
          ...prev.services[section],
          [type]: !prev.services[section][type],
        },
      },
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files).map((f) => f.name);
    setForm((prev) => ({ ...prev, photos: files }));
  };

  const handleAddCustomService = () => {
    const trimmed = customServiceInput.trim();
    if (trimmed && !customServices.includes(trimmed)) {
      setCustomServices([...customServices, trimmed]);
      setCustomServiceInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    const fullForm = {
      ...form,
      services: {
        ...form.services,
        serviceTypes: {
          ...form.services.serviceTypes,
          ...Object.fromEntries(customServices.map((s) => [s, true])),
        },
      },
    };

    try {
      setLoading(true);
      console.log("Submitting:", fullForm);
      await axios.post("http://localhost:5000/serviceDB", fullForm); // ✅ SUBMIT TO JSON-SERVER
      alert("Signup successful!");
      navigate("/service-login"); 
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <div className={styles.logoContainer}>
            <Wrench className={styles.logo} />
            <h1 className={styles.title}>Service Provider Registration</h1>
          </div>
          <p className={styles.subtitle}>
            Join our network of trusted service providers
          </p>
        </div>

        <div className={styles.form}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={form.companyName}
              onChange={handleChange}
              className={styles.input}
            />
            <Building2 className={styles.inputIcon} />
          </div>

          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className={styles.input}
            />
            <User className={styles.inputIcon} />
          </div>

          <div className={styles.inputWrapper}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={styles.input}
            />
            <Mail className={styles.inputIcon} />
          </div>

          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={styles.input}
            />
            <Lock className={styles.inputIcon} />
            <span
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          <div className={styles.inputWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={styles.input}
            />
            <Lock className={styles.inputIcon} />
            <span
              className={styles.passwordToggle}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              className={styles.input}
            />
            <MapPin className={styles.inputIcon} />
          </div>

          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="mapLink"
              placeholder="Google Maps Link"
              value={form.mapLink}
              onChange={handleChange}
              className={styles.input}
            />
            <MapPin className={styles.inputIcon} />
          </div>

          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className={styles.input}
            />
            <Phone className={styles.inputIcon} />
          </div>

          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="landline"
              placeholder="Landline Number"
              value={form.landline}
              onChange={handleChange}
              className={styles.input}
            />
            <Phone className={styles.inputIcon} />
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Wrench className={styles.sectionIcon} />
              Service Types Offered
            </h2>

            <div className={styles.checkboxGrid}>
              {serviceTypes.map(({ key, label }) => (
                <label key={key} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.services.serviceTypes[key]}
                    onChange={() => handleCheckboxChange("serviceTypes", key)}
                    className={styles.checkbox}
                  />
                  <div className={styles.checkboxCard}>
                    <Wrench className={styles.checkboxIcon} />
                    <span className={styles.checkboxText}>{label}</span>
                  </div>
                </label>
              ))}
              {customServices.map((service) => (
                <label key={service} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className={styles.checkbox}
                  />
                  <div className={styles.checkboxCard}>
                    <Wrench className={styles.checkboxIcon} />
                    <span className={styles.checkboxText}>{service}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Add custom service"
                value={customServiceInput}
                onChange={(e) => setCustomServiceInput(e.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                onClick={handleAddCustomService}
                className={styles.passwordToggle}
              >
                + Add
              </button>
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className={styles.input}
            />
            <Camera className={styles.inputIcon} />
          </div>

          <div className={styles.termsWrapper}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className={styles.blackCheckbox}
              />
              I agree to the{" "}
              <span className={styles.termsText}>Terms and Conditions</span>
            </label>
            <button
              type="button"
              className={styles.termsButton}
              onClick={() => alert("Navigate to service login")}
            >
              View Terms & Login
            </button>
          </div>

          <div className={styles.submitWrapper}>
            <button
              onClick={handleSubmit}
              className={styles.submitButton}
              disabled={loading}
            >
              <User className={styles.submitIcon} />
              {loading ? "Registering..." : "Register as Service Provider"}
            </button>
            {loading && (
              <p className={styles.loadingText}>Submitting your info...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSignup;