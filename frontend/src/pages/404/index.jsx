import React from 'react';
import image404 from '../../images/404.svg';
import './style.scss';
import {ROUTE_LANDING_PAGE} from "../../constants/constants";

const Notfound = () => {
  return (
    <div className="h-screen w-screen">
      <img src={image404} alt="404" className="h-screen w-screen"/>
      <div className="absolute w-full text-center home-button">
        <a href={ROUTE_LANDING_PAGE}  className="bg-blue-500 hover:bg-blue-500 text-white font-bold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded inline-flex items-center">
          Take Me Home
        </a>
      </div>
    </div>
  );
};

export default Notfound;