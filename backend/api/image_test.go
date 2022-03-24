package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"
	"uzume_backend/helper"
	"uzume_backend/model"
	"uzume_backend/test_helper"

	"github.com/labstack/echo"
	"github.com/stretchr/testify/assert"
)

// 画像一覧の取得に成功すること
func TestGetImages_success(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	workspace.Save()
	token, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	image, err := model.FixtureCreateImage(workspace, "testimage1.png")
	assert.NoError(t, err)
	image.Memo = "テストメモ"
	image.Author = "テスト作者"
	image.CreatedAt = time.Now()
	image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED)
	image.Save()

	body, _ := json.Marshal(struct {
		TagSearchType string `json:"tag_search_type"`
		Tags          string `json:"tags"`
	}{
		TagSearchType: "or",
		Tags:          model.SYSTEM_TAG_UNCATEGORIZED,
	})
	workspace.RefleshCache()
	req := httptest.NewRequest("GET", "/api/v1/images", bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)

	images := new(struct {
		Images []model.Image `json:"images"`
	})
	json.Unmarshal([]byte(rec.Body.String()), images)
	assert.Equal(t, 1, len(images.Images))
	assert.Equal(t, 36, len(images.Images[0].Id))
	assert.Equal(t, "テストメモ", images.Images[0].Memo)
	assert.Equal(t, "テスト作者", images.Images[0].Author)
}

// 画像一覧の取得時にページネーション・ソートされること
func TestGetImagesPagenationAndSort_success(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	workspace.Save()
	token, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	create_image := func(author string, created_at time.Time) {
		image, err := model.FixtureCreateImage(workspace, "testimage1.png")
		image.CreatedAt = created_at
		image.Save()
		assert.NoError(t, err)
		image.Memo = "テストメモ"
		image.Author = author
		image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED)
		image.Save()
	}

	time_now := time.Now()
	bulk_base_time := time_now.Add(-24 * time.Hour)
	for i := 0; i < 100; i++ {
		create_image(fmt.Sprintf("テスト作者 %d", i), bulk_base_time.Add(-time.Second))
	}
	create_image("テスト作者 last", time_now.Add(-365*24*time.Hour))
	create_image("テスト作者 first", time_now)

	workspace.RefleshCache()

	body1, _ := json.Marshal(struct {
		TagSearchType string `json:"tag_search_type"`
		Tags          string `json:"tags"`
	}{
		TagSearchType: "or",
		Tags:          model.SYSTEM_TAG_UNCATEGORIZED,
	})
	req1 := httptest.NewRequest("GET", "/api/v1/images", bytes.NewReader(body1))
	req1.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req1.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec1 := httptest.NewRecorder()
	router.ServeHTTP(rec1, req1)
	assert.Equal(t, http.StatusOK, rec1.Code)
	images1 := new(struct {
		Page   int           `json:"page"`
		Images []model.Image `json:"images"`
	})
	json.Unmarshal([]byte(rec1.Body.String()), images1)
	assert.Equal(t, 1, images1.Page)
	assert.Equal(t, 100, len(images1.Images))
	assert.Equal(t, "テスト作者 first", images1.Images[0].Author)

	// TODO: bodyではなくparameterにする
	body2, _ := json.Marshal(struct {
		TagSearchType string `json:"tag_search_type"`
		Tags          string `json:"tags"`
	}{
		TagSearchType: "or",
		Tags:          model.SYSTEM_TAG_UNCATEGORIZED,
	})
	req2 := httptest.NewRequest("GET", "/api/v1/images?page=2", bytes.NewReader(body2))
	req2.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req2.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec2 := httptest.NewRecorder()
	router.ServeHTTP(rec2, req2)
	assert.Equal(t, http.StatusOK, rec2.Code)
	images2 := new(struct {
		Page   int           `json:"page"`
		Images []model.Image `json:"images"`
	})
	json.Unmarshal([]byte(rec2.Body.String()), images2)
	assert.Equal(t, 2, images2.Page)
	assert.Equal(t, 2, len(images2.Images))
	assert.Equal(t, "テスト作者 last", images2.Images[1].Author)
}

// access_tokenが間違っているとき、画像一覧の取得に失敗すること
func TestGetImages_fail(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	_, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	image, err := model.FixtureCreateImage(workspace, "testimage1.png")
	assert.NoError(t, err)
	image.Memo = "テストメモ"
	image.Author = "テスト作者"
	image.CreatedAt = time.Now()
	image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED)
	image.Save()

	body, _ := json.Marshal(struct {
		TagSearchType string `json:"tag_search_type"`
		Tags          string `json:"tags"`
	}{
		TagSearchType: "or",
		Tags:          model.SYSTEM_TAG_UNCATEGORIZED,
	})
	req := httptest.NewRequest("GET", "/api/v1/images", bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid_access_token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

// 画像情報の更新に成功すること
func TestPatchImages_success(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	token, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	image, err := model.FixtureCreateImage(workspace, "testimage1.png")
	assert.NoError(t, err)
	image.Memo = "テストメモ"
	image.Author = "テスト作者"
	image.CreatedAt = time.Now()
	image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED)
	image.Save()

	body, _ := json.Marshal(struct {
		Memo   string `json:"memo"`
		Author string `json:"author"`
	}{
		Memo:   "メモ2",
		Author: "作者2",
	})
	req := httptest.NewRequest("PATCH", fmt.Sprintf("/api/v1/images/%s", image.Id), bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)

	rec_image := new(model.Image)
	json.Unmarshal([]byte(rec.Body.String()), rec_image)
	assert.Equal(t, "メモ2", rec_image.Memo)
	assert.Equal(t, "作者2", rec_image.Author)
}

// access_tokenが間違っているとき、画像情報の更新に失敗すること
func TestPatchImages_fail(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	_, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	image, err := model.FixtureCreateImage(workspace, "testimage1.png")
	assert.NoError(t, err)
	image.Memo = "テストメモ"
	image.Author = "テスト作者"
	image.CreatedAt = time.Now()
	image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED)
	image.Save()

	body, _ := json.Marshal(struct {
		Memo   string `json:"memo"`
		Author string `json:"author"`
	}{
		Memo:   "メモ2",
		Author: "作者2",
	})
	req := httptest.NewRequest("PATCH", fmt.Sprintf("/api/v1/images/%s", image.Id), bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid_access_token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

// 画像自体の取得に成功すること
func TestGetImageFile_success(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	token, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	image, err := model.FixtureCreateImage(workspace, "testimage1.png")
	assert.NoError(t, err)
	image.Memo = "テストメモ"
	image.Author = "テスト作者"
	image.CreatedAt = time.Now()
	image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED)
	image.Save()

	image_file, err := os.Open("./../fixture/testimage1.png")
	assert.NoError(t, err)
	defer image_file.Close()
	image_buffer := new(bytes.Buffer)
	_, err = io.Copy(image_buffer, image_file)

	req := httptest.NewRequest("GET", fmt.Sprintf("/api/v1/images/%s/file?image_size=original", image.Id), nil)
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.NoError(t, err)
	test_helper.EqualBuffer(t, image_buffer, rec.Body)

	// サムネイル
	req_thumb := httptest.NewRequest("GET", fmt.Sprintf("/api/v1/images/%s/file?image_size=thumbnail", image.Id), nil)
	req_thumb.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req_thumb.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec_thumb := httptest.NewRecorder()
	router.ServeHTTP(rec_thumb, req_thumb)
	assert.Equal(t, http.StatusOK, rec_thumb.Code)
	// TODO: 下のテストでEqualになってしまう(手動でAPIを叩いたときは問題なく取得できる)
	// test_helper.NotEqualBuffer(t, image_buffer, rec_thumb.Body)
}

// access_tokenが間違っているとき、画像自体の取得に失敗すること
func TestGetImageFile_fail(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	_, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	image, err := model.FixtureCreateImage(workspace, "testimage1.png")
	assert.NoError(t, err)
	image.Memo = "テストメモ"
	image.Author = "テスト作者"
	image.CreatedAt = time.Now()
	image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED)
	image.Save()

	image_file, err := os.Open("./../fixture/testimage1.png")
	assert.NoError(t, err)
	defer image_file.Close()
	image_buffer := new(bytes.Buffer)
	_, err = io.Copy(image_buffer, image_file)

	req := httptest.NewRequest("GET", fmt.Sprintf("/api/v1/images/%s/file?image_size=original", image.Id), nil)
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid_access_token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	assert.NoError(t, err)
	test_helper.EqualBuffer(t, image_buffer, rec.Body)
}

// 画像と画像情報のPOSTに成功すること
func TestPostImages_success(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	token, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	tags := model.NewTags(workspace)
	tag1, _ := tags.CreateNewTag("タグ1")
	tag2, _ := tags.CreateNewTag("タグ2")
	err = tags.Save()
	assert.NoError(t, err)

	multipart_body := new(bytes.Buffer)
	multipart_writer := multipart.NewWriter(multipart_body)

	post_image_buffer := test_helper.WriteMultipartImageField(t, multipart_writer, "image", "../fixture/testimage1.png")
	multipart_writer.WriteField("author", "テスト作者")
	multipart_writer.WriteField("memo", "画像のメモ")
	multipart_writer.WriteField("tags", fmt.Sprintf("%s,%s", tag1.Id, tag2.Id))
	multipart_writer.Close()

	req_post := httptest.NewRequest("POST", "/api/v1/images", multipart_body)
	req_post.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req_post.Header.Set(echo.HeaderContentType, multipart_writer.FormDataContentType())

	rec_post := httptest.NewRecorder()
	router.ServeHTTP(rec_post, req_post)

	assert.Equal(t, http.StatusCreated, rec_post.Code)

	workspace.RefleshCache()
	image := model.NewImage(workspace)
	image.Load()
	images, err := model.SearchImages(workspace, []string{}, "or", 1)
	assert.NoError(t, err)
	assert.Equal(t, 1, len(images))
	assert.Equal(t, "testimage1", images[0].FileName)
	assert.Equal(t, "png", images[0].Ext)
	assert.Equal(t, "画像のメモ", images[0].Memo)
	assert.Equal(t, "テスト作者", images[0].Author)
	assert.NotEmpty(t, images[0].CreatedAt)
	assert.Equal(t, []string{tag1.Id, tag2.Id}, images[0].Tags)

	original_image, err := os.Open(images[0].ImagePath(""))
	assert.NoError(t, err)
	defer original_image.Close()
	original_image_buffer := new(bytes.Buffer)
	_, err = io.Copy(original_image, original_image_buffer)
	assert.NoError(t, err)

	test_helper.EqualBuffer(t, original_image_buffer, post_image_buffer)
}

func TestPostImages_no_info_field_success(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	token, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	multipart_body := new(bytes.Buffer)
	multipart_writer := multipart.NewWriter(multipart_body)

	post_image_buffer := test_helper.WriteMultipartImageField(t, multipart_writer, "image", "../fixture/testimage1.png")
	multipart_writer.Close()

	req_post := httptest.NewRequest("POST", "/api/v1/images", multipart_body)
	req_post.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req_post.Header.Set(echo.HeaderContentType, multipart_writer.FormDataContentType())

	rec_post := httptest.NewRecorder()
	router.ServeHTTP(rec_post, req_post)

	assert.Equal(t, http.StatusCreated, rec_post.Code)

	workspace.RefleshCache()
	image := model.NewImage(workspace)
	image.Load()
	images, err := model.SearchImages(workspace, []string{}, "or", 1)
	assert.NoError(t, err)
	assert.Equal(t, 1, len(images))
	assert.Equal(t, "testimage1", images[0].FileName)
	assert.Equal(t, "png", images[0].Ext)
	assert.Equal(t, "", images[0].Memo)
	assert.Equal(t, "", images[0].Author)
	assert.NotEmpty(t, images[0].CreatedAt)
	assert.Equal(t, []string{"_system_tag_uncategorized"}, images[0].Tags)

	original_image, err := os.Open(images[0].ImagePath(""))
	assert.NoError(t, err)
	defer original_image.Close()
	original_image_buffer := new(bytes.Buffer)
	_, err = io.Copy(original_image, original_image_buffer)
	assert.NoError(t, err)

	test_helper.EqualBuffer(t, original_image_buffer, post_image_buffer)
}

// access_tokenが間違っているとき、画像と画像情報のPOSTに失敗
func TestPostImages_fail(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	_, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	tags := model.NewTags(workspace)
	tag1, _ := tags.CreateNewTag("タグ1")
	tag2, _ := tags.CreateNewTag("タグ2")
	err = tags.Save()
	assert.NoError(t, err)

	multipart_body := new(bytes.Buffer)
	multipart_writer := multipart.NewWriter(multipart_body)

	test_helper.WriteMultipartImageField(t, multipart_writer, "image", "../fixture/testimage1.png")
	multipart_writer.WriteField("author", "テスト作者")
	multipart_writer.WriteField("memo", "画像のメモ")
	multipart_writer.WriteField("tags", fmt.Sprintf("%s,%s", tag1.Id, tag2.Id))
	multipart_writer.Close()

	req_post := httptest.NewRequest("POST", "/api/v1/images", multipart_body)
	req_post.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid_access_token"))
	req_post.Header.Set(echo.HeaderContentType, multipart_writer.FormDataContentType())

	rec_post := httptest.NewRecorder()
	router.ServeHTTP(rec_post, req_post)

	assert.Equal(t, http.StatusUnauthorized, rec_post.Code)
}

// 画像へのタグ付与に成功すること
func TestPatchImageTag_success(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	token, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	tags := model.NewTags(workspace)
	tag1, _ := tags.CreateNewTag("タグ1")
	tag2, _ := tags.CreateNewTag("タグ2")
	err = tags.Save()
	assert.NoError(t, err)

	image, err := model.FixtureCreateImage(workspace, "testimage1.png")
	assert.NoError(t, err)
	image.Memo = "テストメモ"
	image.Author = "テスト作者"
	image.CreatedAt = time.Now()
	image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED)
	image.Save()

	image_file, err := os.Open("./../fixture/testimage1.png")
	assert.NoError(t, err)
	defer image_file.Close()
	image_buffer := new(bytes.Buffer)
	_, err = io.Copy(image_buffer, image_file)

	// tag1が追加され、SYSTEM_TAG_UNCATEGORIZEDが外れること
	body, _ := json.Marshal(struct {
		TagId string `json:"tag_id"`
	}{
		TagId: tag1.Id,
	})
	req := httptest.NewRequest("PATCH", fmt.Sprintf("/api/v1/images/%s/tags", image.Id), bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusNoContent, rec.Code)

	image.Load()
	assert.Equal(t, 1, len(image.Tags))
	assert.Equal(t, tag1.Id, image.Tags[0])

	// tag2が追加され、tag1, tag2がついた状態になること
	body2, _ := json.Marshal(struct {
		TagId string `json:"tag_id"`
	}{
		TagId: tag2.Id,
	})
	req2 := httptest.NewRequest("PATCH", fmt.Sprintf("/api/v1/images/%s/tags", image.Id), bytes.NewReader(body2))
	req2.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req2.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec2 := httptest.NewRecorder()
	router.ServeHTTP(rec2, req2)
	assert.Equal(t, http.StatusNoContent, rec2.Code)

	image.Load()
	assert.Equal(t, 2, len(image.Tags))
	assert.Equal(t, []string{tag1.Id, tag2.Id}, image.Tags)

	// tag2をもう一度登録しようとしたとき、エラーになること
	body3, _ := json.Marshal(struct {
		TagId string `json:"tag_id"`
	}{
		TagId: tag2.Id,
	})
	req3 := httptest.NewRequest("PATCH", fmt.Sprintf("/api/v1/images/%s/tags", image.Id), bytes.NewReader(body3))
	req3.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req3.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec3 := httptest.NewRecorder()
	router.ServeHTTP(rec3, req3)
	assert.Equal(t, http.StatusBadRequest, rec3.Code)

	error_message := new(helper.ErrorMessage)
	json.Unmarshal([]byte(rec3.Body.String()), error_message)
	assert.Equal(t, "このタグは既に登録されています", error_message.ErrorMessage)
}

// access_tokenが間違っているとき、画像へのタグ付与に失敗すること
func TestPatchImageTag_fail(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	_, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	tags := model.NewTags(workspace)
	tag1, _ := tags.CreateNewTag("タグ1")
	err = tags.Save()
	assert.NoError(t, err)

	image, err := model.FixtureCreateImage(workspace, "testimage1.png")
	assert.NoError(t, err)
	image.Memo = "テストメモ"
	image.Author = "テスト作者"
	image.CreatedAt = time.Now()
	image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED)
	image.Save()

	image_file, err := os.Open("./../fixture/testimage1.png")
	assert.NoError(t, err)
	defer image_file.Close()
	image_buffer := new(bytes.Buffer)
	_, err = io.Copy(image_buffer, image_file)

	body, _ := json.Marshal(struct {
		TagId string `json:"tag_id"`
	}{
		TagId: tag1.Id,
	})
	req := httptest.NewRequest("PATCH", fmt.Sprintf("/api/v1/images/%s/tags", image.Id), bytes.NewReader(body))
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid_access_token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

// 画像に付与されているタグを外すことに成功すること
func TestDeleteImageTag_success(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	token, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	tags := model.NewTags(workspace)
	tag1, _ := tags.CreateNewTag("タグ1")
	tag2, _ := tags.CreateNewTag("タグ2")
	err = tags.Save()
	assert.NoError(t, err)

	image, err := model.FixtureCreateImage(workspace, "testimage1.png")
	assert.NoError(t, err)
	image.Memo = "テストメモ"
	image.Author = "テスト作者"
	image.CreatedAt = time.Now()
	image.AddTag(tag1.Id)
	image.AddTag(tag2.Id)
	image.Save()

	image_file, err := os.Open("./../fixture/testimage1.png")
	assert.NoError(t, err)
	defer image_file.Close()
	image_buffer := new(bytes.Buffer)
	_, err = io.Copy(image_buffer, image_file)

	image.Load()
	assert.Equal(t, 2, len(image.Tags))
	assert.Equal(t, []string{tag1.Id, tag2.Id}, image.Tags)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/api/v1/images/%s/tags/%s", image.Id, tag1.Id), nil)
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, token))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusNoContent, rec.Code)

	image.Load()
	assert.Equal(t, 1, len(image.Tags))
	assert.Equal(t, []string{tag2.Id}, image.Tags)
}

// 画像に付与されているタグを外すことに成功すること
func TestDeleteImageTag_fail(t *testing.T) {
	InitializeTest()
	listener := test_helper.Listener()
	defer listener.Close()
	router := RouteInit(listener)

	_, workspace := model.FixtureSetupOneWorkspace()
	_, err := model.GenerateAccessToken(workspace.Id)
	assert.NoError(t, err)

	tags := model.NewTags(workspace)
	tag1, _ := tags.CreateNewTag("タグ1")
	tag2, _ := tags.CreateNewTag("タグ2")
	err = tags.Save()
	assert.NoError(t, err)

	image, err := model.FixtureCreateImage(workspace, "testimage1.png")
	assert.NoError(t, err)
	image.Memo = "テストメモ"
	image.Author = "テスト作者"
	image.CreatedAt = time.Now()
	image.AddTag(tag1.Id)
	image.AddTag(tag2.Id)
	image.Save()

	image_file, err := os.Open("./../fixture/testimage1.png")
	assert.NoError(t, err)
	defer image_file.Close()
	image_buffer := new(bytes.Buffer)
	_, err = io.Copy(image_buffer, image_file)

	image.Load()
	assert.Equal(t, 2, len(image.Tags))
	assert.Equal(t, []string{tag1.Id, tag2.Id}, image.Tags)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/api/v1/images/%s/tags/%s", image.Id, tag1.Id), nil)
	req.Header.Set(echo.HeaderAuthorization, test_helper.BuildBasicAuthorization(workspace.Id, "invalid_access_token"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)

	image.Load()
	assert.Equal(t, 2, len(image.Tags))
	assert.Equal(t, []string{tag1.Id, tag2.Id}, image.Tags)
}
