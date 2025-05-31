import React from "react";
import { Link, useNavigate } from "react-router-dom";

function FristHeader({ toggles, toggles1 }) {
  const handlePrint = () => {
    const options = { year: 'numeric', month: 'long' };
    const content = document.getElementById("call-calender").outerHTML;
    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'absolute';
    printWindow.style.width = '0px';
    printWindow.style.height = '0px';
    printWindow.style.border = 'none';
    document.body.appendChild(printWindow);
    const printDocument = printWindow.contentWindow.document;
    printDocument.open();
    printDocument.write(`
        <html>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="print-color-adjust" content="exact">
            <head>
                <title>Daily Schedule Calendar</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <link href="/assets/css/style.css" rel="stylesheet">
                <style>
                  @media print {
                    @page {
                      size: A4 landscape;
                      margin: none; 
                    }
                    body {
                      font-family: Arial, sans-serif;
                    }
                    .padding{
                      margin: 10px;
                    }
                      .spx{
                       display:flex;
                       justify-content: space-between;
                       margin-right: 10px
                      }
                       .weeks td {
                          position: relative;
                          height: auto !important;
                          width: 250px !important;
                          padding: 10px !important;
                          font-size: 10px !important;
                      }
                      .edit-select {
                          padding-top: 10px !important;
                      }
                      #icon-arrow-print{
                        display: none !important;
                      }
                      #print-title{
                        font-size: 20px !important;
                        margin-bottom: 20px !important;
                        font-weight: 700 !important;
                        // border-bottom: 1px solid #333 !important;
                      }
                  }
                </style>
            </head>
            <body class="bg-white">
              <div class="padding">
              ${content}
              </div>
            </body>
        </html>
    `);
    printDocument.close();

    printWindow.onload = () => {
      printWindow.contentWindow.focus();
      printWindow.contentWindow.print();

      // Remove the iframe after printing
      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 1000);
    }
  };
  return (
    <div className="send-msg absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[1165px] top-[-35px] py-5 text-center rounded-xl flex justify-between items-center px-10">
      <div className="left flex items-center content-center justify-item-center">
        <Link
          to="/"
          className="svgx flex justify-item-start h-[35px] w-[35px] justify-center items-center rounded bg-white text-[#657E98] hover:bg-[#657E98] hover:transition hover:duration-300"
        >
          <svg
            id="Group_63"
            data-name="Group 63"
            xmlns="http://www.w3.org/2000/svg"
            width="26.19"
            height="23.833"
            viewBox="0 0 26.19 23.833"
          >
            <defs>
              <clipPath id="clip-path">
                <rect
                  id="Rectangle_59"
                  data-name="Rectangle 59"
                  width="26.19"
                  height="23.833"
                  transform="translate(0 0)"
                  fill="#657e98"
                />
              </clipPath>
            </defs>
            <g
              id="Group_61"
              data-name="Group 61"
              transform="translate(0 0)"
              clip-path="url(#clip-path)"
            >
              <path
                id="Path_10"
                data-name="Path 10"
                d="M25.926,12.63,21,7.657V1.577a.327.327,0,0,0-.327-.327H18.309a.327.327,0,0,0-.327.327V4.608L13.59.177a.613.613,0,0,0-.869,0L.267,12.63A.912.912,0,0,0,1.2,14.141h0l2.6-.885v9.822a.75.75,0,0,0,.75.75h4.9a.75.75,0,0,0,.75-.75V15.621h5.927v7.457a.75.75,0,0,0,.75.75h4.9a.75.75,0,0,0,.75-.75V13.292l2.43.829a.912.912,0,0,0,.981-1.491"
                transform="translate(0 0.005)"
                fill="#657e98"
              />
            </g>
          </svg>
        </Link>
        <button
          onClick={toggles}
          type="button"
          className="border-none px-4 py-1 rounded bg-white mx-2 inter-medium text-[18px]"
        >
          Call Counter
        </button>

        <button
          onClick={toggles1}
          type="button"
          className="border-none px-4 py-1 rounded bg-white mx-2 inter-medium text-[18px]"
        >
          Vacation
        </button>
      </div>
      <h1 className="flex ms-[50px] inter-medium text-[24px] items-center content-center justify-item-center">
        Monthly Call Calender
      </h1>
      <div className="right flex items-center content-center justify-item-center">
        {/* <Link to="/daily-schedule"
          className="bg-white h-[35px] w-[37px] flex items-center justify-center mx-2 rounded hover:bg-[#D8ADAD] group relative"
        >
          <img
            src="assets/images/back.png"
            alt="Original Image"
            className="block"
          />
          <img
            src="assets/images/back-hover.png"
            alt="Hover Image"
            className="absolute hover-img"
          />
        </Link> */}
        <button
          onClick={handlePrint}
          type="button"
          className="border-none px-4 py-1 rounded bg-white mx-2 inter-medium text-[18px]"
        >
          Print Calender
        </button>
        <Link
          to="/edit-call-calender"
          className="border-none px-4 py-1 rounded bg-white mx-2 inter-medium text-[18px]"
        >
          Edit Calender
        </Link>
      </div>
    </div>
  );
}

export default FristHeader;
