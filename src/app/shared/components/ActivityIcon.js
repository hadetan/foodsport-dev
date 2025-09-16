"use client";

import React from 'react';
import { FaBezierCurve, FaBrain, FaHiking, FaMendeley, FaRunning } from 'react-icons/fa';
import { GrYoga } from "react-icons/gr";
import { IoIosFitness } from "react-icons/io";
import { BiCycling } from "react-icons/bi";
import { FaPersonSwimming, FaUserGroup } from "react-icons/fa6";
import { RiTeamFill } from "react-icons/ri";
import { HiQuestionMarkCircle } from "react-icons/hi2";
import { GiBodyBalance, GiTennisRacket } from "react-icons/gi";
import { ACTIVITY_TYPES_FORMATTED } from "@/app/constants/constants";
import { useTranslations } from 'next-intl';
import Tooltip from './Tooltip';

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

export default function ActivityIcon({ type, size = 24, className = '', translate = true }) {
  const idx = ACTIVITY_TYPES_FORMATTED.indexOf(type);
  const key = idx !== -1 ? ACTIVITY_TYPES_FORMATTED[idx] : "other";

  let title = null;
  if (translate) {
  const t = useTranslations();
  title = translate ? (t(`Activity.ActivityTypes.${key}`) || t('Activity.ActivityTypes.other')) : null;
  }

  const iconConfig = iconMap[type] || { Component: HiQuestionMarkCircle };
  const { Component } = iconConfig;

  // Render with Tooltip only when translate === true
  if (translate) {
    return (
      <Tooltip content={title}>
        <Component size={size} className={className} />
      </Tooltip>
    );
  }

  return <Component size={size} className={className} />;
}
