import {useEffect, useMemo, useState} from 'react';
import {useLinksStore} from '~/store/LinksStore';
import styles from './Navigation.module.css';
import {useLocation} from "react-router";
import {useFetcher} from "@remix-run/react"


const Navigation = () => {
  const {
    dbUserDetails,
    currentPage,
    setShowToast,
    setToastMessage,
  } = useLinksStore(state => ({
    dbUserDetails: state.dbUserDetails,
    currentPage: state.currentPage,
    setCurrentPage: state.setCurrentPage,
    setShowToast: state.setShowToast,
    setToastMessage: state.setToastMessage,
  }));

  const [previousPage, setPreviousPage] = useState('');
  const location = useLocation();
  const path = location.pathname;
  const fetcher = useFetcher();

  const handlePageChange = async (next_page: string) => {
    const formData = new FormData();

    setPreviousPage(path);
    formData.append('page', next_page);
    fetcher.submit(formData, {method: 'post'});
  }

  const handlePreviousPage = async () => {

    const formData = new FormData();
    if (previousPage) {
      formData.append('page', previousPage);
    } else {
      formData.append('page', 'edit-links');
    }
    formData.append('action', 'change-page');
    fetcher.submit(formData, {method: 'post'});
  }

  const handleShareLink = async () => {

    const newURL = `${window.location.origin}/share/${dbUserDetails.share_uuid}`;
    // Fallback to textarea method for mobile support
    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea");
      textArea.value = newURL;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        setShowToast(true);
        setToastMessage('The link has been copied to your clipboard!');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }

      document.body.removeChild(textArea);
      return;
    }

    // Using the Clipboard API
    try {
      await navigator.clipboard.writeText(newURL);
      setShowToast(true);
      setToastMessage('The link has been copied to your clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoize the logo rendering based on sessionId
  const logo = useMemo(() => {

    switch (path) {
      case '/dashboard/links':
      case '/dashboard/profile':
        return (
          <div className={styles.navigation_content}>
            <div className={styles.navigation_group}>
              <div className={styles.img_container}>
                <div className={styles.img_group}>
                  <div className={styles.svg_container}>
                    <div className={styles.img}></div>
                  </div>
                </div>
              </div>
              <div className={styles.link_group}>
                <div
                  role={'presentation'}
                  className={`${styles.icon_container} ${path === '/dashboard/links' ? styles.active : ''}`}
                  onClick={() => handlePageChange('edit-links')}>
                  <svg className={styles.svg_img}
                       xmlns="http://www.w3.org/2000/svg"
                       width="16" height="16" fill="none"
                       viewBox="0 0 16 16">
                    <path fill=""
                          d="M8.523 11.72a.749.749 0 0 1 0 1.063l-.371.371A3.751 3.751 0 1 1 2.847 7.85l1.507-1.506A3.75 3.75 0 0 1 9.5 6.188a.753.753 0 0 1-1 1.125 2.25 2.25 0 0 0-3.086.091L3.908 8.91a2.25 2.25 0 0 0 3.183 3.183l.37-.371a.748.748 0 0 1 1.062 0Zm4.63-8.874a3.756 3.756 0 0 0-5.305 0l-.371.37A.751.751 0 1 0 8.539 4.28l.372-.37a2.25 2.25 0 0 1 3.182 3.182l-1.507 1.507a2.25 2.25 0 0 1-3.086.09.753.753 0 0 0-1 1.125 3.75 3.75 0 0 0 5.144-.152l1.507-1.507a3.756 3.756 0 0 0 .002-5.307v-.001Z"/>
                  </svg>
                  {isMobile ? '' : 'Links'}
                </div>
                <div
                  className={`${styles.icon_container} ${path === '/dashboard/profile' ? styles.active : ''}`}
                  role={'presentation'}
                  onClick={() => handlePageChange('edit-profile')}>
                  <svg className={styles.svg_img}
                       xmlns="http://www.w3.org/2000/svg"
                       width="21" height="20" fill="none"
                       viewBox="0 0 21 20">
                    <path fill=""
                          d="M10.5 1.563A8.437 8.437 0 1 0 18.938 10 8.447 8.447 0 0 0 10.5 1.562ZM6.716 15.357a4.688 4.688 0 0 1 7.568 0 6.54 6.54 0 0 1-7.568 0Zm1.596-5.982a2.188 2.188 0 1 1 4.376 0 2.188 2.188 0 0 1-4.376 0Zm7.344 4.683a6.523 6.523 0 0 0-2.265-1.83 4.062 4.062 0 1 0-5.782 0 6.522 6.522 0 0 0-2.265 1.83 6.562 6.562 0 1 1 10.304 0h.008Z"/>
                  </svg>
                  {isMobile ? '' : 'Profile Details'}
                </div>
              </div>
              <div className={styles.preview_icon_container}
                   role={'presentation'}
                   onClick={() => handlePageChange('preview-links')}>
                {isMobile ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                         fill="none"
                         viewBox="0 0 20 20">
                      <path fill="#633CFF"
                            d="M19.61 9.62c-.03-.064-.714-1.583-2.225-3.095-2.023-2.02-4.572-3.088-7.385-3.088-2.812 0-5.362 1.068-7.382 3.088C1.106 8.037.422 9.556.391 9.62a.944.944 0 0 0 0 .761c.029.064.713 1.583 2.226 3.095 2.021 2.02 4.57 3.086 7.383 3.086 2.813 0 5.362-1.067 7.381-3.086 1.513-1.512 2.197-3.03 2.226-3.095a.946.946 0 0 0 .003-.761Zm-3.599 2.578c-1.677 1.651-3.7 2.49-6.01 2.49-2.313 0-4.334-.839-6.01-2.491A10.185 10.185 0 0 1 2.307 10a10.192 10.192 0 0 1 1.686-2.196C5.667 6.15 7.688 5.312 10 5.312s4.333.839 6.009 2.492c.659.652 1.226 1.39 1.685 2.196a10.19 10.19 0 0 1-1.685 2.197h.002Zm-6.01-5.636a3.438 3.438 0 1 0 0 6.876 3.438 3.438 0 0 0 0-6.876Zm0 5A1.562 1.562 0 1 1 10 8.438a1.562 1.562 0 0 1 0 3.124Z"/>
                    </svg>)
                  :
                  'Preview'
                }

              </div>
            </div>
          </div>
        )
      case '/dashboard/preview':
        return (
          <div className={styles.preview_button_container}>
            <button onClick={handlePreviousPage} className={styles.back}>Back to
              Editor
            </button>
            <button className={styles.share} onClick={handleShareLink}> Share
              Link
            </button>

          </div>
        )

      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="183" height="40"
               fill="none" viewBox="0 0 183 40">
            <path fill="#633CFF" fillRule="evenodd"
                  d="M5.774 34.225c2.443 2.442 6.37 2.442 14.226 2.442 7.857 0 11.785 0 14.225-2.442 2.442-2.438 2.442-6.368 2.442-14.225 0-7.857 0-11.785-2.442-14.226-2.438-2.44-6.368-2.44-14.225-2.44-7.857 0-11.785 0-14.226 2.44-2.44 2.443-2.44 6.37-2.44 14.226 0 7.857 0 11.785 2.44 14.225Zm10.06-19.642A5.416 5.416 0 1 0 21.25 20a1.25 1.25 0 1 1 2.5 0 7.917 7.917 0 1 1-7.916-7.916 1.25 1.25 0 0 1 0 2.5ZM29.584 20a5.417 5.417 0 0 1-5.417 5.417 1.25 1.25 0 0 0 0 2.5A7.917 7.917 0 1 0 16.25 20a1.25 1.25 0 0 0 2.5 0 5.416 5.416 0 1 1 10.834 0Z"
                  clipRule="evenodd"/>
            <path fill="#333"
                  d="M61.247 32.15v-3.955l.346.07c-.23 1.283-.923 2.31-2.077 3.08-1.131.77-2.493 1.155-4.086 1.155-1.616 0-3.024-.373-4.225-1.12-1.177-.77-2.089-1.843-2.735-3.22-.647-1.377-.97-2.998-.97-4.865 0-1.89.335-3.535 1.004-4.935.67-1.4 1.605-2.485 2.805-3.255 1.224-.77 2.643-1.155 4.26-1.155 1.684 0 3.046.397 4.085 1.19 1.062.793 1.685 1.878 1.87 3.255l-.38.035V6.95h5.194v25.2h-5.09Zm-4.155-3.85c1.223 0 2.216-.432 2.978-1.295.762-.887 1.143-2.147 1.143-3.78s-.393-2.882-1.178-3.745c-.762-.887-1.766-1.33-3.012-1.33-1.2 0-2.194.443-2.978 1.33-.762.887-1.143 2.147-1.143 3.78s.38 2.882 1.143 3.745c.785.863 1.8 1.295 3.047 1.295ZM78.801 32.5c-1.962 0-3.67-.385-5.125-1.155-1.454-.793-2.585-1.89-3.393-3.29-.785-1.4-1.178-3.01-1.178-4.83 0-1.843.393-3.453 1.178-4.83a8.395 8.395 0 0 1 3.358-3.255c1.432-.793 3.094-1.19 4.987-1.19 1.824 0 3.405.373 4.744 1.12a7.89 7.89 0 0 1 3.116 3.115c.739 1.33 1.108 2.893 1.108 4.69 0 .373-.011.723-.034 1.05-.023.303-.058.595-.104.875H72.153v-3.465h11.115l-.9.63c0-1.447-.347-2.508-1.04-3.185-.669-.7-1.592-1.05-2.77-1.05-1.361 0-2.423.467-3.185 1.4-.739.933-1.108 2.333-1.108 4.2 0 1.82.37 3.173 1.108 4.06.762.887 1.893 1.33 3.393 1.33.831 0 1.547-.14 2.147-.42.6-.28 1.05-.735 1.35-1.365h4.883c-.577 1.727-1.57 3.092-2.978 4.095-1.385.98-3.174 1.47-5.367 1.47ZM94.68 32.15 87.72 14.3h5.575l5.437 16.66h-2.91l5.403-16.66h5.436l-6.96 17.85h-5.02ZM108.669 32.15V6.95h5.194v25.2h-5.194ZM118.002 32.15V14.3h5.194v17.85h-5.194Zm-.173-20.23V6.25h5.54v5.67h-5.54ZM127.335 32.15V14.3h5.09v4.2h.104v13.65h-5.194Zm12.293 0V21.09c0-.98-.254-1.715-.762-2.205-.485-.49-1.2-.735-2.147-.735-.808 0-1.535.187-2.181.56a4.118 4.118 0 0 0-1.489 1.54c-.347.653-.52 1.423-.52 2.31l-.45-4.305c.577-1.307 1.42-2.345 2.528-3.115 1.131-.793 2.516-1.19 4.155-1.19 1.963 0 3.463.56 4.502 1.68 1.039 1.097 1.558 2.578 1.558 4.445V32.15h-5.194ZM148.775 32.15V6.95h5.194v25.2h-5.194Zm11.323 0-7.341-9.275 7.168-8.575h5.99l-8.414 9.38.242-1.645 8.519 10.115h-6.164Z"/>
            <path fill="#333"
                  d="M174.743 32.5c-2.585 0-4.64-.525-6.163-1.575-1.524-1.05-2.355-2.497-2.494-4.34h4.641c.115.793.507 1.4 1.177 1.82.692.397 1.639.595 2.839.595 1.085 0 1.87-.152 2.355-.455.508-.327.762-.782.762-1.365 0-.443-.15-.782-.45-1.015-.277-.257-.797-.467-1.558-.63l-2.84-.595c-2.101-.443-3.647-1.108-4.64-1.995-.993-.91-1.489-2.077-1.489-3.5 0-1.727.658-3.068 1.974-4.025 1.316-.98 3.151-1.47 5.506-1.47 2.331 0 4.189.478 5.575 1.435 1.385.933 2.146 2.24 2.285 3.92h-4.64c-.092-.607-.416-1.062-.97-1.365-.554-.327-1.339-.49-2.354-.49-.924 0-1.616.14-2.078.42-.439.257-.658.63-.658 1.12 0 .42.185.758.554 1.015.369.233.981.443 1.835.63l3.186.665c1.778.373 3.117 1.073 4.017 2.1.923 1.003 1.385 2.193 1.385 3.57 0 1.75-.681 3.115-2.043 4.095-1.339.957-3.243 1.435-5.714 1.435Z"/>
          </svg>)

    }
  }, [currentPage, handlePageChange]);

  return (
    <div
      className={`${styles.navigation_container} ${path === '/' && styles.home} ${path === '/dashboard/preview' && styles.preview}`}>
      {logo}
    </div>
  );
};

export default Navigation;
