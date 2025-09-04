import React from 'react';
import { FaBezierCurve, FaBrain, FaHiking, FaMendeley, FaRunning } from 'react-icons/fa';
import { GrYoga } from "react-icons/gr";
import { IoIosFitness } from "react-icons/io";
import { BiCycling } from "react-icons/bi";
import { FaPersonSwimming, FaUserGroup } from "react-icons/fa6";
import { RiBoxingFill, RiTeamFill } from "react-icons/ri";
import { HiQuestionMarkCircle } from "react-icons/hi2";
import { GiBodyBalance, GiTennisRacket } from "react-icons/gi";
import { ACTIVITY_TYPES, ACTIVITY_TYPES_FORMATTED } from "@/app/constants/constants";

const iconMap = {
  "Running": { Component: FaRunning },
  "Hiking": { Component: FaHiking },
  "Water_Sport": { Component: FaPersonSwimming },
  "Volunteering": { Component: FaUserGroup },
  "Racket_Sport": { Component: GiTennisRacket },
  "Yoga": { Component: GrYoga },
  "Dance": { Component: GiBodyBalance },
  "Fitness": { Component: IoIosFitness },
  "Cycling": { Component: BiCycling },
  "Mindfulness": { Component: FaBrain },
  "Team_Sport": { Component: RiTeamFill },
  "Virtual": { Component: FaBezierCurve },
  "Multi_Sports": { Component: FaMendeley },
};

export default function ActivityIcon({ type, size = 24, className = '' }) {
  const iconConfig = iconMap[type] || { Component: HiQuestionMarkCircle };
  const { Component } = iconConfig;
  const idx = ACTIVITY_TYPES_FORMATTED.indexOf(type);
  const title = idx !== -1 ? ACTIVITY_TYPES[idx] : "other";
  return <Component size={size} className={className} title={title} />;
}
