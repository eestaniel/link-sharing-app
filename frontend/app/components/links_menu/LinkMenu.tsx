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

export const LinkMenuStyles = (platform: string) => {

  switch (platform) {
    case 'github':
      return styles.github;
    case 'frontend_mentor':
      return styles.frontend_mentor;
    case 'twitter':
      return styles.twitter;
    case 'linkedIn':
      return styles.linkedIn;
    case 'youtube':
      return styles.youtube;
    case 'facebook':
      return styles.facebook;
    case 'twitch':
      return styles.twitch;
    case 'dev_to':
      return styles.dev_to;
    case 'codewars':
      return styles.codewars;
    case 'codepen':
      return styles.codepen;
    case 'freecodecamp':
      return styles.freecodecamp;
    case 'gitlab':
      return styles.gitlab;
    case 'hashnode':
      return styles.hashnode;
    case 'stackoverflow':
      return styles.stackoverflow;
    default:
      return styles.default;
  }
}

export const LinkMenuPlaceholder = (platform: string) => {
  switch (platform) {
    case 'github':
      return 'e.g. https://www.github.com/johnappleseed'

    case 'frontend_mentor':
      return 'e.g. https://www.frontendmentor.io/profile/johnappleseed'

    case 'twitter':
      return 'e.g. https://twitter.com/johnappleseed'

    case 'linkedIn':
      return 'e.g. https://www.linkedin.com/in/johnappleseed'

    case 'youtube':
      return 'e.g. https://www.youtube.com/channel/johnappleseed'

    case 'facebook':
      return 'e.g. https://www.facebook.com/johnappleseed'

    case 'twitch':
      return 'e.g. https://www.twitch.tv/johnappleseed'

    case 'dev_to':
      return 'e.g. https://dev.to/johnappleseed'

    case 'codewars':
      return 'e.g. https://www.codewars.com/users/johnappleseed'

    case 'codepen':
      return 'e.g. https://codepen.io/johnappleseed'

    case 'freecodecamp':
      return 'e.g. https://www.freecodecamp.org/johnappleseed'

    case 'gitlab':
      return 'e.g. https://gitlab.com/johnappleseed'

    case 'hashnode':
      return 'e.g. https://hashnode.com/@johnappleseed'

    case 'stackoverflow':
      return 'e.g. https://stackoverflow.com/users/johnappleseed'


    default:
      return 'e.g. https://www.example.com/johnappleseed'
  }
}

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


