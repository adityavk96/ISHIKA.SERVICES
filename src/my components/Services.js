import React from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const Services = () => {
  const servicesList = [
    { name: "GSTR 1", icon: FileText, link: "/Gst-1" },
    { name: "GSTR 3B", icon: FileText, link: "/Gst-3B" },
    { name: "GSTR 2A", icon: FileText, link: "/gst-2B" },
    { name: "GSTR 2B", icon: FileText, link: "/gst-2B" },
    { name: "GSTR 2A OR 2B", icon: FileText, link: "/Gst-Reco" },
    { name: "GSTR 9", icon: FileText, link: "/Gst-9" },
    // Add more services here as needed
  ];

  return (
    <main className="flex flex-col items-center w-full p-6 pt-12 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800">Our Services</h1>

      <p className="text-lg text-center text-gray-600 mt-4 mb-10">
        We offer a range of professional services tailored to your needs.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full mx-auto justify-items-center">
        {servicesList.map((service, index) => {
          const Icon = service.icon;
          return (
            <Link
              to={service.link}
              key={index}
              className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 max-w-xs w-full"
            >
              <Icon className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">{service.name}</h3>
            </Link>
          );
        })}
      </div>
    </main>
  );
};

export default Services;
