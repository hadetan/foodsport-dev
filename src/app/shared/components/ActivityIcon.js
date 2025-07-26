import {
  FaHiking,
  FaRunning
} from 'react-icons/fa';
import { MdKayaking } from 'react-icons/md';
import { GrYoga } from "react-icons/gr";
import { IoIosFitness } from "react-icons/io";
import { BiCycling } from "react-icons/bi";
import { FaPersonSwimming } from "react-icons/fa6";
import { RiBoxingFill } from "react-icons/ri";
import { HiQuestionMarkCircle } from "react-icons/hi2";
import React from 'react';

const iconMap = {
  kayak: <MdKayaking title="Kayak" />,
  hiking: <FaHiking title="Hiking" />,
  yoga: <GrYoga title="Yoga" />,
  fitness: <IoIosFitness title="Fitness" />,
  running: <FaRunning title="Running" />,
  cycling: <BiCycling title="Cycling" />,
  swimming: <FaPersonSwimming title="Swimming" />,
  boxing: <RiBoxingFill title="Boxing" />,
  other: <HiQuestionMarkCircle  title="Other" />,
};

export default function ActivityIcon({ type, size = 24, className = '' }) {
  const icon = iconMap[type] || iconMap.other;
  return React.cloneElement(icon, { size, className });
}
