import React from 'react';
import styles from "./LinkMenu.module.css";
import {LinkMenuIcons} from "./LinkMenuIcons";

export type LinkKey =
    'github' | 'frontend_mentor' | 'twitter' | 'linkedIn' |
    'youtube' | 'facebook' | 'twitch' | 'dev_to' |
    'codewars' | 'codepen' | 'freecodecamp' |
    'gitlab' | 'hashnode' | 'stackoverflow';


export const linkMenuList: Record<LinkKey, string> = {
  github: 'GitHub',
  frontend_mentor: 'Frontend Mentor',
  twitter: 'Twitter',
  linkedIn: 'LinkedIn',
  youtube: 'YouTube',
  facebook: 'Facebook',
  twitch: 'Twitch',
  dev_to: 'Dev.to',
  codewars: 'CodeWars',
  codepen: 'CodePen',
  freecodecamp: 'FreeCodeCamp',
  gitlab: 'GitLab',
  hashnode: 'Hashnode',
  stackoverflow: 'StackOverflow',
};

export const LinkMenu = () => {

  return (
      <ul className={styles.menu_container}>
        {Object.entries(linkMenuList).map(([key, label]) => (
            <li className={styles.menu_item} key={key}>
              {LinkMenuIcons[key as LinkKey] || <span>No icon available</span>}
              <span>{label}</span>
            </li>
        ))}
      </ul>
  );
};


