-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 20, 2019 at 09:53 AM
-- Server version: 10.3.11-xxxxx-log
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `testDB`
--

-- --------------------------------------------------------

--
-- Table structure for table `testTable`
--

CREATE TABLE `testTable` (
  `id` int(11) NOT NULL,
  `iCounter` int(11) NOT NULL,
  `testCol1` text NOT NULL,
  `testCol2` int(11) NOT NULL,
  `testCol3` int(11) NOT NULL,
  `testCol4` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Truncate table before insert `testTable`
--

TRUNCATE TABLE `testTable`;
--
-- Dumping data for table `testTable`
--

INSERT INTO `testTable` (`id`, `iCounter`, `testCol1`, `testCol2`, `testCol3`, `testCol4`) VALUES
(1, 1012, '1012', 2012, 3012, 4012);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `testTable`
--
ALTER TABLE `testTable`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `testTable`
--
ALTER TABLE `testTable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=140;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
