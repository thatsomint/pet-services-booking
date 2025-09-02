import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

const PetServicesApp = () => {
  const [petType, setPetType] = useState("");
  const [location, setLocation] = useState("");
  const [petService, setPetService] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  const petTypes = [
    "Dogs",
    "Cats",
    "Rabbits",
    "Hamsters",
    "Guinea Pigs",
    "Chinchillas",
    "Ferrets",
    "Birds",
    "Turtles",
    "Iguanas",
  ];

  const locations = [
    "Central (District 1-2)",
    "West (District 5-8, 22-23)",
    "East (District 14-18)",
    "North (District 19-21, 26-28)",
    "South (District 3-4, 9-10)",
    "North-East (District 11-13, 24-25)",
  ];

  const services = ["Grooming", "Sitter", "Pet Hotel"];
  const datePickerRef = useRef(null);

  useEffect(() => {
    if (datePickerRef.current) {
      flatpickr(datePickerRef.current, {
        mode: "range",
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: (selectedDates, dateStr) => {
          setDateRange(dateStr);
        },
      });
    }
  }, []);

  const toggleDropdown = (dropdown) => {
    setShowPetDropdown(dropdown === "pet" ? !showPetDropdown : false);
    setShowLocationDropdown(dropdown === "location" ? !showLocationDropdown : false);
    setShowServiceDropdown(dropdown === "service" ? !showServiceDropdown : false);
  };

  const handleSearch = () => {
    alert(
      `Searching for:\nPet: ${petType}\nLocation: ${location}\nService: ${petService}\nDate: ${dateRange}`
    );
  };

  return (
    <div>
      {/* Copy your header, hero, search, services, footer HTML here */}
      {/* Replace class="" with className="" */}
      {/* Replace inline <i class="..."></i> icons with FontAwesome React components (optional) */}
    </div>
  );
};

export default PetServicesApp;
