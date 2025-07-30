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
   kayak: { Component: MdKayaking, title: "Kayak" },
   hiking: { Component: FaHiking, title: "Hiking" },
   yoga: { Component: GrYoga, title: "Yoga" },
   fitness: { Component: IoIosFitness, title: "Fitness" },
   running: { Component: FaRunning, title: "Running" },
   cycling: { Component: BiCycling, title: "Cycling" },
   swimming: { Component: FaPersonSwimming, title: "Swimming" },
   boxing: { Component: RiBoxingFill, title: "Boxing" },
   other: { Component: HiQuestionMarkCircle, title: "Other" },
 };

export default function ActivityIcon({ type, size = 24, className = '' }) {
  const iconConfig = iconMap[type] || iconMap.other;
  const { Component, title } = iconConfig;
  return <Component size={size} className={className} title={title} />;
}
