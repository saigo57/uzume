import React from 'react';
import './CenterListMenu.scss';

import {MainHeader} from '../../Molecules/MainHeader/MainHeader';
import {ImageList} from '../../Molecules/ImageList/ImageList';

const ImageListProps ={
    ImagePreviewItems : [
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      },
      {
        ImagePath : "../contents/img/design-server-icon.jpg"
      }
    ]
  }

export const CenterListMenu = () => {
    return (
        <section id="main" className="main">
            <MainHeader />
            <ImageList {...ImageListProps}/>
        </section>
    );
}