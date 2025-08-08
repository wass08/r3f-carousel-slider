export const OverlayComponent = () => {
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    background: 'linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.2) 20%, transparent 35%)'
  };

  const logoContainerStyle = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    opacity: 0,
    animation: 'fadeInDown 0.8s ease-out 0.2s forwards',
    '@media (min-width: 768px)': {
      top: '32px',
      left: '56px'
    }
  };

  const logoLinkStyle = {
    pointerEvents: 'auto',
    userSelect: 'none'
  };

  const logoImageStyle = {
    width: '80px',
    height: '80px',
    objectFit: 'contain'
  };

  const bottomTextContainerStyle = {
    position: 'absolute',
    bottom: '32px',
    left: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    animationDelay: '1.5s',
    animation: 'fadeInDown 0.8s ease-out 1.5s forwards',
    opacity: 0,
    '@media (min-width: 768px)': {
      left: '56px'
    }
  };

  const lineStyle = {
    width: '80px',
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)'
  };

  const bottomTextLinkStyle = {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '14px',
    pointerEvents: 'auto',
    userSelect: 'none',
    textDecoration: 'none',
    transition: 'color 0.2s ease-in-out'
  };

  // Add keyframes for animations
  const keyframes = `
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <section style={overlayStyle}>
        <div style={logoContainerStyle}>
          <a
            style={logoLinkStyle}
            href="https://wawasensei.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/wawasensei-white.png"
              alt="Wawa Sensei logo"
              style={logoImageStyle}
            />
          </a>
        </div>
        <div style={bottomTextContainerStyle}>
          <div style={lineStyle}></div>
          <a
            href="https://wawasensei.dev/courses/react-three-fiber/"
            style={bottomTextLinkStyle}
          >
            Learn Three.js & React Three Fiber
          </a>
        </div>
      </section>
    </>
  );
};