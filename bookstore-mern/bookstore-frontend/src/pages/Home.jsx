import { useState, useEffect } from "react";
import axios from "axios";
import BookCard from "../components/BookCard";
import Banner from "../components/Banner";
import SearchBar from "../components/SearchBar";
import PromoPopup from "../components/PromoPopup";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  