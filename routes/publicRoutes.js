const express = require("express");
const router = express.Router();
const db = require("../db/config");
const upload = require("../middleware/upload.js");

router.post("/news/create", (req, res) => {
  const { title, content} = req.body;

  const sql = `
    INSERT INTO news (title, content)
    VALUES (?, ?)
  `;

  db.query(sql, [title, content], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Hiba létrehozáskor" });
    }
    res.json({ message: "Sikeres létrehozás", id: result.insertId, title: req.body.title});
  });
});



router.get("/news", (req, res) => {

  db.query("SELECT * FROM news ORDER BY created_at DESC", (err, results) => {

    if (err) {
      console.error("Hiba a lekérésnél:", err);
      return res.status(500).json({ message: "Szerver hiba" });
    }

    res.json(results);

  });

});

router.delete("/news/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM news WHERE id = ?", [id], (err, result) => {

    if (err) {
      console.error("Törlés hiba:", err);
      return res.status(500).json({ message: "Szerver hiba" });
    }

    res.json({ message: "Hír törölve" });

  });
});


router.put("/news/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  db.query(
    "UPDATE news SET title = ?, content = ? WHERE id = ?",
    [title, content, id],
    (err, result) => {

      if (err) {
        console.error("Update hiba:", err);
        return res.status(500).json({ message: "Szerver hiba" });
      }

      res.json({ message: "Hír frissítve" });

    }
  );
});

router.get("/messages", (req, res) => {

db.query("SELECT * from messages ORDER BY created_at DESC ", (err, results) => {

  if(err){
    console.error("Hiba történt a lekérdezés során!");
    return res.status(500).json({message: "Szerver hiba történt!"})
  }

  res.json(results);

})


})


router.delete("/messages/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM messages WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Üzenet törlés hiba:", err);
      return res.status(500).json({ message: "Szerver hiba" });
    }

    res.json({ message: "Üzenet törölve" });
  });
});

router.put("/messages/:id", (req, res) => {
  const { id } = req.params;
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ message: "Hiányzó adatok" });
  }

  db.query(
    "UPDATE messages SET name = ?, message = ? WHERE id = ?",
    [name, message, id],
    (err, result) => {
      if (err) {
        console.error("Üzenet frissítés hiba:", err);
        return res.status(500).json({ message: "Szerver hiba" });
      }

      res.json({ message: "Üzenet frissítve" });
    }
  );
});



router.get("/events", (req, res) => {
  const sql = `
    SELECT events.*, units.name AS unit_name
    FROM events
    LEFT JOIN units ON events.unit_id = units.id
    WHERE event_date >= CURDATE()
    ORDER BY event_date ASC
  `;

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Events hiba:", err);
      return res.status(500).json({ error: "Adatbázis hiba" });
    }

    res.json(data);
  });
});




router.get("/units", (req, res) => {
  db.query("SELECT * FROM units", (err, units) => {
    if (err) {
      console.error("Units hiba:", err);
      return res.status(500).json({ error: "Adatbázis hiba" });
    }

    res.json(units);
  });
});


router.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Hiányzó adatok" });
  }

  const sql = `
    INSERT INTO messages (name, email, message)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [name, email, message], (err) => {
    if (err) {
      console.error("Contact hiba:", err);
      return res.status(500).json({ error: "Mentési hiba" });
    }

    res.json({ message: "Üzenet sikeresen elküldve!" });
  });
});


router.post("/login", (req, res) => {

  const { name, password, email } = req.body;

  if (!name || !password || !email) {
    return res.status(400).json({ message: "Kötelező megadni az adatokat!" });
  }

  const sql = `
    SELECT id, username, email 
    FROM users 
    WHERE username = ? AND email = ? AND password = ?
  `;

  db.query(sql, [name, email, password], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Szerver hiba" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Hibás adatok!" });
    }

    const user = results[0];

    res.json({
      message: "Sikeres bejelentkezés",
      username: user.username
    });

  });

});


router.post("/create/students", (req, res) => {
  const { name, className } = req.body;

  if (!name || !className) {
    return res.status(400).json({ message: "Hiányzó adatok" });
  }

  db.query(
    "INSERT INTO students (name, class) VALUES (?, ?)",
    [name, className],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Hiba" });
      }

      res.json({ id: result.insertId });
    }
  );
});

router.get("/students", (req, res) => {

   db.query("SELECT * from students ", (err, results) => {

        if(err){
          return res.status(500).json({message: "Szerver hiba törtémt!"})
        }

        res.status(200).json(results);

   })

})

router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nincs fájl feltöltve" });
    }

    const fileType = req.body.type || "egyeb";

    const filePath = `/uploads/${req.file.filename}`;

    const sql = `
      INSERT INTO uploads (filename, original_name, file_type, file_path)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        req.file.filename,
        req.file.originalname,
        fileType,
        filePath
      ],
      (err, result) => {
        if (err) {
          console.error("DB hiba:", err);
          return res.status(500).json({ message: "Adatbázis hiba" });
        }

        res.json({
          message: "Feltöltve és mentve!",
          filePath
        });
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message || "Hiba feltöltéskor"
    });
  }
});



module.exports = router;