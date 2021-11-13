package helper

import (
	"encoding/base64"
	"fmt"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo"
	"github.com/stretchr/testify/assert"
)

func TestJsonIndent(t *testing.T) {
	json := "{\"foo\":1, \"bar\":2}"
	result, _ := JsonIndent([]byte(json))
	assert.Equal(t, "{\n  \"foo\": 1,\n  \"bar\": 2\n}", result)
}

// func TestIsTesting(t *testing.T) {
// }

// func TestDirExists(t *testing.T) {
// }

// func TestFileExists(t *testing.T) {
// }

// func TestCreateFile(t *testing.T) {
// }

// func TestSecureRandomStr(t *testing.T) {
// }

func TestLoggedinWrokspaceId(t *testing.T) {
	e := echo.New()
	authorization_raw := "test_workspace_id:test_access_token"
	authorization := fmt.Sprintf("basic %s", base64.StdEncoding.EncodeToString([]byte(authorization_raw)))
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set(echo.HeaderAuthorization, authorization)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	assert.Equal(t, "test_workspace_id", LoggedinWrokspaceId(c))
}

// func TestMakeRouteDir(t *testing.T) {
// }

func TestSplitFileNameAndExt(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name             string
		file_path        string
		expect_file_name string
		expect_ext       string
	}{
		{
			name:             "normal",
			file_path:        "test.png",
			expect_file_name: "test",
			expect_ext:       "png",
		},
		{
			name:             "拡張子なし",
			file_path:        "testpng",
			expect_file_name: "testpng",
			expect_ext:       "",
		},
		{
			name:             "ドットが複数回現れる",
			file_path:        "test.png.jpg",
			expect_file_name: "test.png",
			expect_ext:       "jpg",
		},
		{
			name:             "ファイル名がドットから始まる",
			file_path:        ".test.png",
			expect_file_name: ".test",
			expect_ext:       "png",
		},
		{
			name:             "ファイル名がドットから始まり拡張子がない",
			file_path:        ".test",
			expect_file_name: ".test",
			expect_ext:       "",
		},
		{
			name:             "ファイルパスが含まれる",
			file_path:        "hoge/test.png",
			expect_file_name: "test",
			expect_ext:       "png",
		},
		{
			name:             "ディレクトリ名にドットが含まれる",
			file_path:        "hoge.foo/test.png",
			expect_file_name: "test",
			expect_ext:       "png",
		},
		{
			name:             "ディレクトリがドットから始まる",
			file_path:        ".foo/test.png",
			expect_file_name: "test",
			expect_ext:       "png",
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got_file_name, got_ext := SplitFileNameAndExt(tt.file_path)
			if got_file_name != tt.expect_file_name || got_ext != tt.expect_ext {
				t.Errorf("SplitFileNameAndExt() = %v, %v, want %v,%v", got_file_name, got_ext, tt.expect_file_name, tt.expect_ext)
			}
		})
	}
}
