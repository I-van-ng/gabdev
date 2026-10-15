package com.example.myapp

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapp.ui.theme.GabBlue
import com.example.myapp.ui.theme.GabGreen
import com.example.myapp.ui.theme.GabYellow
import com.example.myapp.ui.theme.MyAppTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyAppTheme {
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    containerColor = Color(0xFF09090B)
                ) { innerPadding ->
                    GabDevApp(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

// Data models
data class MobileService(
    val title: String,
    val description: String,
    val category: String,
    val color: Color
)

data class MobileResource(
    val title: String,
    val category: String,
    val description: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GabDevApp(modifier: Modifier = Modifier) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var apiStatus by remember { mutableStateOf("Vérification...") }
    var isApiConnected by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Backend URL (10.0.2.2 for Android emulator pointing to host localhost:3000)
    val backendBaseUrl = "http://10.0.2.2:3000"

    // Check backend health on launch
    LaunchedEffect(Unit) {
        scope.launch(Dispatchers.IO) {
            try {
                val url = URL("$backendBaseUrl/api/health")
                val connection = (url.openConnection() as HttpURLConnection).apply {
                    connectTimeout = 3000
                    readTimeout = 3000
                    requestMethod = "GET"
                }
                if (connection.responseCode == 200) {
                    val reader = BufferedReader(InputStreamReader(connection.inputStream))
                    val response = reader.readText()
                    reader.close()
                    val json = JSONObject(response)
                    val engine = json.optString("engine", "GABdev Engine")
                    withContext(Dispatchers.Main) {
                        apiStatus = "En ligne • $engine"
                        isApiConnected = true
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        apiStatus = "Mode Autonome"
                        isApiConnected = false
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    apiStatus = "Mode Déconnecté"
                    isApiConnected = false
                }
            }
        }
    }

    val services = listOf(
        MobileService("Développement Web", "Sites vitrines & SaaS performants", "React / Next.js", GabGreen),
        MobileService("Applications Mobiles", "Apps Android & iOS ultra-fluides", "Flutter & Dart", GabBlue),
        MobileService("Design UI/UX", "Prototypes et design systems Figma", "Figma / Tailwind", GabYellow),
        MobileService("Identité Visuelle", "Logos et chartes graphiques d'impact", "Branding Pro", Color(0xFFA855F7))
    )

    val resources = listOf(
        MobileResource("Intégrer Airtel & Moov Money", "FINTECH", "Guide complet paiement mobile USSD au Gabon"),
        MobileResource("Regex Numéros Gabonais (9 chiffres)", "SNIPPET", "Fonction de validation pour 062, 065, 074, 077..."),
        MobileResource("Cloud Souverain Gabon", "DEVOPS", "Hébergement local sécurisé et réduction de latence")
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF09090B))
    ) {
        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "GAB",
                        fontWeight = FontWeight.Black,
                        fontSize = 24.sp,
                        color = Color.White
                    )
                    Text(
                        text = "dev",
                        fontWeight = FontWeight.Black,
                        fontSize = 24.sp,
                        color = GabGreen
                    )
                }
                Text(
                    text = "L'élite tech gabonaise",
                    fontSize = 11.sp,
                    color = Color.Gray,
                    fontWeight = FontWeight.Bold
                )
            }

            // Backend status chip
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = if (isApiConnected) Color(0xFF14532D) else Color(0xFF27272A),
                modifier = Modifier.padding(start = 8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .clip(CircleShape)
                            .background(if (isApiConnected) GabGreen else GabYellow)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = apiStatus,
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Tab Row
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color(0xFF121215),
            contentColor = GabGreen,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                    color = GabGreen
                )
            }
        ) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text("Prestations", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text("Ressources", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
            )
            Tab(
                selected = selectedTab == 2,
                onClick = { selectedTab = 2 },
                text = { Text("Demander Devis", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
            )
        }

        // Content
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            when (selectedTab) {
                0 -> {
                    // Prestations & Services
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        item {
                            Card(
                                shape = RoundedCornerShape(20.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(18.dp)) {
                                    Text(
                                        text = "Accompagnement Numérique Sur-Mesure",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 16.sp,
                                        color = Color.White
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = "Fondé par Ivan Ndoumba Nguia, GABdev conçoit vos plateformes web, applications mobiles et identités de marque pour booster votre entreprise.",
                                        fontSize = 12.sp,
                                        color = Color(0xFFA1A1AA),
                                        lineHeight = 18.sp
                                    )
                                    Spacer(modifier = Modifier.height(14.dp))
                                    Button(
                                        onClick = {
                                            val intent = Intent(Intent.ACTION_VIEW).apply {
                                                data = Uri.parse("https://wa.me/24176360649?text=Bonjour%20GABdev,%20je%20souhaite%20des%20informations%20sur%20vos%20services")
                                            }
                                            context.startActivity(intent)
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = GabGreen),
                                        shape = RoundedCornerShape(12.dp),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text("Discuter sur WhatsApp", color = Color.Black, fontWeight = FontWeight.Black)
                                    }
                                }
                            }
                        }

                        items(services) { s ->
                            Card(
                                shape = RoundedCornerShape(18.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedTab = 2 }
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(10.dp)
                                            .clip(CircleShape)
                                            .background(s.color)
                                    )
                                    Spacer(modifier = Modifier.width(14.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = s.title,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            color = Color.White
                                        )
                                        Text(
                                            text = s.description,
                                            fontSize = 11.sp,
                                            color = Color(0xFFA1A1AA)
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = s.category,
                                            fontSize = 10.sp,
                                            color = s.color,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                    Icon(
                                        imageVector = Icons.Default.ArrowForward,
                                        contentDescription = null,
                                        tint = Color.Gray,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }
                }
                1 -> {
                    // Ressources tech
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item {
                            Text(
                                text = "Base de Connaissance Gabonaise",
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp,
                                color = Color.White,
                                modifier = Modifier.padding(bottom = 8.dp)
                            )
                        }

                        items(resources) { r ->
                            Card(
                                shape = RoundedCornerShape(18.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = Color(0xFF1E3A8A)
                                        ) {
                                            Text(
                                                text = r.category,
                                                color = GabBlue,
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = r.title,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = Color.White
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = r.description,
                                        fontSize = 11.sp,
                                        color = Color(0xFFA1A1AA)
                                    )
                                }
                            }
                        }
                    }
                }
                2 -> {
                    // Formulaire Devis Express
                    var clientName by remember { mutableStateOf("") }
                    var clientContact by remember { mutableStateOf("") }
                    var clientDesc by remember { mutableStateOf("") }
                    var isSending by remember { mutableStateOf(false) }
                    var feedbackMessage by remember { mutableStateOf<String?>(null) }

                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item {
                            Text(
                                text = "Soumettre un Projet à GABdev",
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp,
                                color = Color.White
                            )
                            Text(
                                text = "Remplissez ce formulaire pour transmettre directement votre besoin à notre équipe.",
                                fontSize = 12.sp,
                                color = Color(0xFFA1A1AA)
                            )
                        }

                        item {
                            OutlinedTextField(
                                value = clientName,
                                onValueChange = { clientName = it },
                                label = { Text("Votre nom complet *", color = Color.Gray) },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = GabGreen,
                                    unfocusedBorderColor = Color(0xFF27272A),
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )
                        }

                        item {
                            OutlinedTextField(
                                value = clientContact,
                                onValueChange = { clientContact = it },
                                label = { Text("Numéro WhatsApp ou Email *", color = Color.Gray) },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = GabGreen,
                                    unfocusedBorderColor = Color(0xFF27272A),
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )
                        }

                        item {
                            OutlinedTextField(
                                value = clientDesc,
                                onValueChange = { clientDesc = it },
                                label = { Text("Description de votre projet *", color = Color.Gray) },
                                minLines = 3,
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = GabGreen,
                                    unfocusedBorderColor = Color(0xFF27272A),
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )
                        }

                        if (feedbackMessage != null) {
                            item {
                                Text(
                                    text = feedbackMessage!!,
                                    color = GabGreen,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        item {
                            Button(
                                onClick = {
                                    if (clientName.isBlank() || clientContact.isBlank() || clientDesc.isBlank()) {
                                        feedbackMessage = "Veuillez remplir tous les champs."
                                        return@Button
                                    }
                                    isSending = true
                                    scope.launch(Dispatchers.IO) {
                                        try {
                                            val url = URL("$backendBaseUrl/api/services/inquiry")
                                            val conn = (url.openConnection() as HttpURLConnection).apply {
                                                requestMethod = "POST"
                                                setRequestProperty("Content-Type", "application/json")
                                                doOutput = true
                                                connectTimeout = 4000
                                            }
                                            val json = JSONObject().apply {
                                                put("name", clientName)
                                                put("contact", clientContact)
                                                put("service", "mobile")
                                                put("description", clientDesc)
                                            }
                                            val writer = OutputStreamWriter(conn.outputStream)
                                            writer.write(json.toString())
                                            writer.flush()
                                            writer.close()

                                            withContext(Dispatchers.Main) {
                                                isSending = false
                                                feedbackMessage = "Demande reçue ! Redirection WhatsApp..."
                                                // Also open WhatsApp
                                                val msg = "Bonjour GABdev ! Nom: $clientName | Contact: $clientContact | Projet: $clientDesc"
                                                val intent = Intent(Intent.ACTION_VIEW).apply {
                                                    data = Uri.parse("https://wa.me/24176360649?text=${Uri.encode(msg)}")
                                                }
                                                context.startActivity(intent)
                                            }
                                        } catch (e: Exception) {
                                            withContext(Dispatchers.Main) {
                                                isSending = false
                                                // Fallback directly to WhatsApp
                                                feedbackMessage = "Ouverture directe de WhatsApp..."
                                                val msg = "Bonjour GABdev ! Nom: $clientName | Contact: $clientContact | Projet: $clientDesc"
                                                val intent = Intent(Intent.ACTION_VIEW).apply {
                                                    data = Uri.parse("https://wa.me/24176360649?text=${Uri.encode(msg)}")
                                                }
                                                context.startActivity(intent)
                                            }
                                        }
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = GabGreen),
                                shape = RoundedCornerShape(12.dp),
                                enabled = !isSending,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = if (isSending) "Envoi en cours..." else "Envoyer la demande",
                                    color = Color.Black,
                                    fontWeight = FontWeight.Black
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun WelcomePreview() {
    MyAppTheme {
        GabDevApp()
    }
}
