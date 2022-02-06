package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"uzume_backend/test_helper"

	"github.com/labstack/echo"
	"github.com/stretchr/testify/assert"
)

// バージョンが取得できること
func TestGetVersion(t *testing.T) {
	test_helper.InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	req := httptest.NewRequest("GET", "/api/version", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
}
