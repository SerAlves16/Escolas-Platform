import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SeedUser {
  email: string;
  password: string;
  fullName: string;
  role: string;
  schoolId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get the school
    const { data: schools, error: schoolErr } = await admin
      .from("schools")
      .select("id, name")
      .limit(1);
    if (schoolErr || !schools || schools.length === 0) {
      return new Response(JSON.stringify({ error: "No school found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const schoolId = schools[0].id;

    // Define all seed users
    const seedUsers: SeedUser[] = [
      { email: "admin@escola.pt", password: "Admin123!", fullName: "Administrador do Sistema", role: "admin", schoolId },
      { email: "direcao@escola.pt", password: "Direcao123!", fullName: "Maria da Direção", role: "direction", schoolId },
      { email: "secretaria1@escola.pt", password: "Secret123!", fullName: "Ana Secretaria", role: "secretaria", schoolId },
      { email: "secretaria2@escola.pt", password: "Secret123!", fullName: "Carlos Secretaria", role: "secretaria", schoolId },
      { email: "professor1@escola.pt", password: "Prof1234!", fullName: "João Silva", role: "teacher", schoolId },
      { email: "professor2@escola.pt", password: "Prof1234!", fullName: "Maria Santos", role: "teacher", schoolId },
      { email: "professor3@escola.pt", password: "Prof1234!", fullName: "Pedro Costa", role: "teacher", schoolId },
      { email: "professor4@escola.pt", password: "Prof1234!", fullName: "Sofia Ferreira", role: "teacher", schoolId },
      { email: "professor5@escola.pt", password: "Prof1234!", fullName: "Rui Oliveira", role: "teacher", schoolId },
      { email: "professor6@escola.pt", password: "Prof1234!", fullName: "Teresa Almeida", role: "teacher", schoolId },
      { email: "professor7@escola.pt", password: "Prof1234!", fullName: "Miguel Pereira", role: "teacher", schoolId },
      { email: "professor8@escola.pt", password: "Prof1234!", fullName: "Beatriz Lopes", role: "teacher", schoolId },
      { email: "professor9@escola.pt", password: "Prof1234!", fullName: "Francisco Martins", role: "teacher", schoolId },
      { email: "professor10@escola.pt", password: "Prof1234!", fullName: "Inês Carvalho", role: "teacher", schoolId },
      { email: "refeitorio@escola.pt", password: "Refei123!", fullName: "Funcionário Refeitório", role: "canteen", schoolId },
      { email: "bar@escola.pt", password: "Bar1234!", fullName: "Funcionário Bar", role: "bar", schoolId },
      { email: "papelaria@escola.pt", password: "Papel123!", fullName: "Funcionário Papelaria", role: "stationery", schoolId },
      { email: "encarregado@escola.pt", password: "Encar123!", fullName: "José Encarregado", role: "parent", schoolId },
    ];

    const results: any[] = [];

    for (const su of seedUsers) {
      // Check if user already exists
      const { data: existing } = await admin.auth.admin.listUsers();
      const found = existing.users.find((u: any) => u.email === su.email);

      let userId: string;

      if (found) {
        userId = found.id;
        results.push({ email: su.email, status: "already_exists", id: userId });
      } else {
        const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
          email: su.email,
          password: su.password,
          email_confirm: true,
          user_metadata: { full_name: su.fullName, role: su.role },
        });

        if (createErr) {
          results.push({ email: su.email, status: "error", error: createErr.message });
          continue;
        }

        userId = newUser.user.id;
        results.push({ email: su.email, status: "created", id: userId });
      }

      // Update profile with correct role and school_id
      await admin.from("profiles").update({
        role: su.role,
        school_id: su.schoolId,
        full_name: su.fullName,
        is_active: true,
      }).eq("id", userId);

      // Create role-specific records
      if (su.role === "teacher") {
        const { data: existingTeacher } = await admin.from("teachers")
          .select("id").eq("profile_id", userId).maybeSingle();
        if (!existingTeacher) {
          await admin.from("teachers").insert({
            school_id: su.schoolId,
            profile_id: userId,
          });
        }
      }

      if (su.role === "parent") {
        const { data: existingParent } = await admin.from("parents")
          .select("id").eq("profile_id", userId).maybeSingle();
        if (!existingParent) {
          await admin.from("parents").insert({
            school_id: su.schoolId,
            profile_id: userId,
          });
        }
      }

      if (su.role === "canteen" || su.role === "bar" || su.role === "stationery") {
        const staffType = su.role === "canteen" ? "canteen" : su.role === "bar" ? "bar" : "stationery";
        const { data: existingStaff } = await admin.from("staff")
          .select("id").eq("profile_id", userId).maybeSingle();
        if (!existingStaff) {
          await admin.from("staff").insert({
            school_id: su.schoolId,
            profile_id: userId,
            staff_type: staffType,
          });
        }
      }
    }

    // Now seed classes, subjects, students, grades, etc.
    const { data: classes } = await admin.from("classes")
      .select("id, name").eq("school_id", schoolId);
    const { data: subjects } = await admin.from("subjects")
      .select("id, name, code").eq("school_id", schoolId);
    const { data: teachers } = await admin.from("teachers")
      .select("id, profile_id, profile:profiles(full_name)").eq("school_id", schoolId);

    // Assign class directors (first 3 teachers)
    if (classes && classes.length >= 3 && teachers && teachers.length >= 3) {
      for (let i = 0; i < 3 && i < classes.length; i++) {
        await admin.from("classes").update({
          class_director_id: teachers[i].profile_id,
        }).eq("id", classes[i].id);

        // Also update their profile role to class_director
        await admin.from("profiles").update({ role: "class_director" })
          .eq("id", teachers[i].profile_id);
      }
    }

    // Create class_subjects (assign teachers to class+subject)
    if (classes && subjects && teachers) {
      for (const cls of classes.slice(0, 5)) {
        for (let si = 0; si < Math.min(subjects.length, 6); si++) {
          const subj = subjects[si];
          const teacher = teachers[si % teachers.length];
          const { data: existing } = await admin.from("class_subjects")
            .select("id").eq("class_id", cls.id).eq("subject_id", subj.id).maybeSingle();
          if (!existing) {
            await admin.from("class_subjects").insert({
              class_id: cls.id,
              subject_id: subj.id,
              teacher_id: teacher.profile_id,
            });
          }
        }
      }
    }

    // Create schedules for first 3 classes
    if (classes && subjects) {
      const days = [1, 2, 3, 4, 5];
      const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00"];
      for (const cls of classes.slice(0, 3)) {
        for (const day of days) {
          for (let t = 0; t < 4; t++) {
            const subj = subjects[(day + t) % subjects.length];
            const { data: existing } = await admin.from("schedules")
              .select("id")
              .eq("class_id", cls.id).eq("day_of_week", day)
              .eq("start_time", times[t]).maybeSingle();
            if (!existing) {
              await admin.from("schedules").insert({
                school_id: schoolId,
                class_id: cls.id,
                subject_id: subj.id,
                day_of_week: day,
                start_time: times[t],
                end_time: times[(t + 1) % times.length] || "16:00",
                room: `${10 + t}`,
              });
            }
          }
        }
      }
    }

    // Create student auth users + student records
    const studentNames = [
      "Aluno Um", "Aluno Dois", "Aluno Três", "Aluno Quatro", "Aluno Cinco",
      "Aluno Seis", "Aluno Sete", "Aluno Oito", "Aluno Nove", "Aluno Dez",
      "Aluno Onze", "Aluno Doze", "Aluno Treze", "Aluno Catorze", "Aluno Quinze",
    ];

    const parentProfileId = results.find(r => r.email === "encarregado@escola.pt")?.id;

    for (let i = 0; i < studentNames.length; i++) {
      const studentEmail = `aluno${i + 1}@escola.pt`;
      const studentPassword = "Aluno123!";

      let studentUserId: string;
      const { data: existingUsers } = await admin.auth.admin.listUsers();
      const foundStudent = existingUsers.users.find((u: any) => u.email === studentEmail);

      if (foundStudent) {
        studentUserId = foundStudent.id;
      } else {
        const { data: newStudent, error: sErr } = await admin.auth.admin.createUser({
          email: studentEmail,
          password: studentPassword,
          email_confirm: true,
          user_metadata: { full_name: studentNames[i], role: "student" },
        });
        if (sErr) continue;
        studentUserId = newStudent.user.id;
      }

      // Update profile
      await admin.from("profiles").update({
        role: "student",
        school_id: schoolId,
        full_name: studentNames[i],
        is_active: true,
      }).eq("id", studentUserId);

      // Create student record
      const { data: existingStudent } = await admin.from("students")
        .select("id").eq("profile_id", studentUserId).maybeSingle();

      let studentRecordId: string;
      if (existingStudent) {
        studentRecordId = existingStudent.id;
      } else {
        const { data: newRec } = await admin.from("students").insert({
          school_id: schoolId,
          profile_id: studentUserId,
          student_number: `2025${String(i + 1).padStart(3, "0")}`,
          qr_token: `QR-STUDENT-${studentUserId.slice(0, 8)}`,
          balance: 20.00 + (i * 5),
        }).select("id").single();
        studentRecordId = newRec?.id || "";
      }

      // Enroll student in a class
      if (classes && classes.length > 0) {
        const cls = classes[i % classes.length];
        const { data: existingEnroll } = await admin.from("enrollments")
          .select("id").eq("student_id", studentRecordId).eq("class_id", cls.id).maybeSingle();
        if (!existingEnroll) {
          await admin.from("enrollments").insert({
            school_id: schoolId,
            student_id: studentRecordId,
            class_id: cls.id,
            school_year: "2025/2026",
          });
        }
      }

      // Link first 2 students to the parent
      if (parentProfileId && i < 2) {
        const { data: parentRec } = await admin.from("parents")
          .select("id").eq("profile_id", parentProfileId).maybeSingle();
        if (parentRec) {
          const { data: existingLink } = await admin.from("parent_students")
            .select("id").eq("parent_id", parentRec.id).eq("student_id", studentRecordId).maybeSingle();
          if (!existingLink) {
            await admin.from("parent_students").insert({
              parent_id: parentRec.id,
              student_id: studentRecordId,
            });
          }
        }
      }

      // Create some grades
      if (subjects) {
        for (let g = 0; g < 4; g++) {
          const subj = subjects[g % subjects.length];
          const { data: existingGrade } = await admin.from("grades")
            .select("id").eq("student_id", studentRecordId)
            .eq("subject_id", subj.id).eq("term", "1º Período").maybeSingle();
          if (!existingGrade) {
            await admin.from("grades").insert({
              school_id: schoolId,
              student_id: studentRecordId,
              subject_id: subj.id,
              term: "1º Período",
              value: Math.round((10 + Math.random() * 9) * 100) / 100,
              assessment_type: ["Teste", "Trabalho", "Participação"][g % 3],
              date: new Date().toISOString().slice(0, 10),
            });
          }
        }
      }

      // Create some attendance
      if (subjects) {
        for (let a = 0; a < 3; a++) {
          const subj = subjects[a % subjects.length];
          const { data: existingAtt } = await admin.from("attendance")
            .select("id").eq("student_id", studentRecordId)
            .eq("subject_id", subj.id)
            .eq("date", new Date(Date.now() - a * 86400000).toISOString().slice(0, 10))
            .maybeSingle();
          if (!existingAtt) {
            await admin.from("attendance").insert({
              school_id: schoolId,
              student_id: studentRecordId,
              subject_id: subj.id,
              date: new Date(Date.now() - a * 86400000).toISOString().slice(0, 10),
              justified: a === 0,
              observation: a === 0 ? "Justificada pelo encarregado" : "Falta injustificada",
            });
          }
        }
      }
    }

    // Create some meal reservations
    const { data: allStudents } = await admin.from("students")
      .select("id").eq("school_id", schoolId).limit(5);
    const { data: menus } = await admin.from("menus")
      .select("id, date").eq("school_id", schoolId).limit(5);

    if (allStudents && menus) {
      for (const student of allStudents) {
        for (const menu of menus.slice(0, 3)) {
          const { data: existingRes } = await admin.from("meal_reservations")
            .select("id").eq("student_id", student.id).eq("date", menu.date).maybeSingle();
          if (!existingRes) {
            await admin.from("meal_reservations").insert({
              school_id: schoolId,
              student_id: student.id,
              menu_id: menu.id,
              date: menu.date,
              status: "reserved",
            });
          }
        }
      }
    }

    // Create some sales
    const { data: barProducts } = await admin.from("products")
      .select("id, price, stock").eq("school_id", schoolId).eq("outlet_type", "bar").limit(3);
    if (allStudents && barProducts && barProducts.length > 0) {
      for (let s = 0; s < 5; s++) {
        const student = allStudents[s % allStudents.length];
        const product = barProducts[s % barProducts.length];
        await admin.from("sales").insert({
          school_id: schoolId,
          student_id: student.id,
          product_id: product.id,
          outlet_type: "bar",
          quantity: 1,
          unit_price: product.price,
          total: product.price,
          payment_method: "balance",
        });
        await admin.from("balance_transactions").insert({
          school_id: schoolId,
          student_id: student.id,
          amount: product.price,
          type: "debit",
          description: `Compra: ${product.id}`,
        });
      }
    }

    // Create balance credit transactions for students
    if (allStudents) {
      for (const student of allStudents) {
        const { data: existingCredit } = await admin.from("balance_transactions")
          .select("id").eq("student_id", student.id).eq("type", "credit").maybeSingle();
        if (!existingCredit) {
          await admin.from("balance_transactions").insert({
            school_id: schoolId,
            student_id: student.id,
            amount: 30.00,
            type: "credit",
            description: "Carregamento inicial",
          });
        }
      }
    }

    // Create homework
    if (classes && subjects) {
      for (const cls of classes.slice(0, 3)) {
        for (let h = 0; h < 2; h++) {
          const subj = subjects[h % subjects.length];
          await admin.from("homework").insert({
            school_id: schoolId,
            class_id: cls.id,
            subject_id: subj.id,
            title: `Trabalho de ${subj.name}`,
            description: `Realizar exercícios da página ${h + 10}.`,
            due_date: new Date(Date.now() + (h + 1) * 7 * 86400000).toISOString().slice(0, 10),
          });
        }
      }
    }

    // Create exams
    if (classes && subjects) {
      for (const cls of classes.slice(0, 3)) {
        for (let e = 0; e < 2; e++) {
          const subj = subjects[e % subjects.length];
          await admin.from("exams").insert({
            school_id: schoolId,
            class_id: cls.id,
            subject_id: subj.id,
            title: `Teste de ${subj.name}`,
            date: new Date(Date.now() + (e + 2) * 14 * 86400000).toISOString().slice(0, 10),
            topics: `Conteúdos do ${e + 1}º período`,
            room: "Sala 101",
          });
        }
      }
    }

    // Create a sample enrollment application from the parent
    if (parentProfileId) {
      const { data: existingApp } = await admin.from("enrollment_applications")
        .select("id").eq("parent_profile_id", parentProfileId).maybeSingle();
      if (!existingApp) {
        const { data: newApp } = await admin.from("enrollment_applications").insert({
          school_id: schoolId,
          parent_profile_id: parentProfileId,
          student_name: "Novo Aluno Pendente",
          student_birth_date: "2012-05-15",
          student_national_id: "123456789",
          student_gender: "M",
          student_address: "Rua Nova, 45",
          grade_applying: "7º ano",
          previous_school: "EB1 da Rua Nova",
          status: "pending",
        }).select("id").single();

        if (newApp) {
          await admin.from("enrollment_documents").insert([
            {
              enrollment_id: newApp.id,
              document_type: "Bilhete de Identidade",
              file_url: "https://example.com/bi.pdf",
              file_name: "bi_aluno.pdf",
            },
            {
              enrollment_id: newApp.id,
              document_type: "Boletim de Vacinas",
              file_url: "https://example.com/vacinas.pdf",
              file_name: "vacinas.pdf",
            },
            {
              enrollment_id: newApp.id,
              document_type: "Certificado de Habilitações",
              file_url: "https://example.com/certificado.pdf",
              file_name: "certificado.pdf",
            },
          ]);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
