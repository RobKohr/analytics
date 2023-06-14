      const analytics = {
        start: function () {
          console.log("analytics started");

          let previousPage = document.referrer;
          let previousPath = '';
          let oldPushState = history.pushState;
          history.pushState = function pushState() {
            let ret = oldPushState.apply(this, arguments);
            window.dispatchEvent(new Event("pushstate"));
            window.dispatchEvent(new Event("locationchange"));
            return ret;
          };

          let oldReplaceState = history.replaceState;
          history.replaceState = function replaceState() {
            let ret = oldReplaceState.apply(this, arguments);
            window.dispatchEvent(new Event("replacestate"));
            window.dispatchEvent(new Event("locationchange"));
            return ret;
          };

          window.addEventListener("popstate", () => {
            window.dispatchEvent(new Event("locationchange"));
          });

          window.addEventListener("locationchange", function () {
            pageLoad();
          });
          function pageLoad() {
            console.log("Previous: " + previousPage);
            const newPage = window.location.href;
            console.log(previousPage + " -> " + newPage);
            console.log("location changed!" + window.location.pathname);
            const analyticsRecord = {
              event: "page_view",
              previous_path: previousPath,
              page_path: window.location.pathname,
              page_location: window.location.href,
              page_title: document.title,
              page_referrer: previousPage,
            };
            const domainName = window.location.hostname;
            const analyticsApi = "https://a." + domainName + "/collect";
            // send to analytics api
            fetch(analyticsApi, {
              method: "POST",
              body: JSON.stringify(analyticsRecord),
            });
            previousPage = newPage;
            previousPath = window.location.pathname;
          }
          pageLoad();
        },
      };